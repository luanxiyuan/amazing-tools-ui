import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ContactsService } from '../../../services/contacts/contacts.service';
import { Location, Person, PersonEntity, Team, TeamEntity, TeamUIEntity } from '../../../types/contacts-type';
import { cloneDeep, get } from 'lodash-es';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';
import { SharedStoreService } from '../../../services/common/shared-store.service';
import { UrlToolService } from '../../../services/common/url-tool.service';
import { CONTACTS_SETTINGS, MODULE_NAMES } from '../../../consts/sys-consts';
import { StringToolService } from '../../../services/common/string-tool.service';
import { CommunicationToolService } from '../../../services/common/communication-tool.service';
import { BaseComponent } from '../../base/base.component';
import { FileToolService } from '../../../services/common/file-tool.service';
import { ToolApps } from '../../../types/home-type';

@Component({
  selector: 'app-contacts-team',
  templateUrl: './contacts-team.component.html',
  styleUrls: ['./contacts-team.component.css']
})
export class ContactsTeamComponent extends BaseComponent {

  searchForm: FormGroup<{
    id: FormControl<String | null>;
    name: FormControl<String | null>;
    teamDl: FormControl<String | null>;
    remark: FormControl<String | null>;
  }> = this.fb.group({
    id: this.fb.control<String | null>(null),
    name: this.fb.control<String | null>(null),
    teamDl: this.fb.control<String | null>(null),
    remark: this.fb.control<String | null>(null)
  });

  public locations: Location[] = [];
  public persons: Person[] = [];
  public teams: Team[] = []
  public filteredTeams: Team[] = [];
  public displayTeams: TeamUIEntity[] = [];
  public teamNames: string[] = [];
  public filteredTeamNames: string[] = [];
  public teamDls: string[] = [];
  public filteredTeamDls: string[] = [];
  public teamRemarks: string[] = [];
  public filteredTeamRemarks: string[] = [];
  public selectedPerson: Person = new PersonEntity();

  public selectedTeam: Team = new TeamEntity();

  public teamAddOrEditDrawerVisible: boolean = false;
  public teamMembersDrawerVisible: boolean = false;
  public editDrawerWidth: number = CONTACTS_SETTINGS.EDIT_DRAWER_WIDTH;
  public teamMembersDrawerWidth: number = CONTACTS_SETTINGS.TEAM_MEMBER_DRAWER_WIDTH;

  validateTeamForm: FormGroup;

  addOrEditMode: 'Add' | "Edit" = 'Add';
  public personAddOrEditDrawerVisible: {'show':boolean} = {'show': false};
  
  badgeOverflowCount: number = CONTACTS_SETTINGS.BADGE_OVERFLOW_COUNT;
  
  showFloatingAddBtnFlag: boolean = false;
  
  teamPageSize: number = CONTACTS_SETTINGS.TEAM_PAGE_SIZE;
  currentPageIndex: number = 1;
  filteredTeamCount: number = 0;

  bbContributionUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    public sharedStoreService: SharedStoreService,
    private urlToolService: UrlToolService,
    public stringToolService: StringToolService,
    private contactsService: ContactsService,
    private route: ActivatedRoute,
    private communicationToolService: CommunicationToolService,
    private fileToolService: FileToolService
  ) {
    super();

    this.validateTeamForm = new FormGroup({
      name: new FormControl('', Validators.required),
      teamDl: new FormControl(''),
      remark: new FormControl('')
    });
  }

  ngOnInit() {
    this.getLocations();
    this.getPersons();

    this.sharedStoreService.getTeamUpdateResultFlag().subscribe(flag => {
      if (flag) {
        this.refreshTeamsAfterUpdate();
      }
    });

    this.sharedStoreService.getPersonUpdateResultFlag().subscribe(flag => {
      if (flag) {
        this.refreshPersonsAfterUpdate();
      }
    });

    this.fileToolService.loadGlobalConfigFile().subscribe((data: any) => {
      const toolApps = data['apps'] || [];
      const appConf = toolApps.filter((app: ToolApps) => app.id === MODULE_NAMES.BB_CONTRIBUTION);
      if (appConf.length > 0) {
        const bbContributionHomePage = get(appConf[0], 'uri', '');
        this.bbContributionUrl = bbContributionHomePage ? bbContributionHomePage + 'commit-list' : '';
      }
    });
  }

  ngAfterViewInit() {
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const tableDiv = document.getElementById('tableDiv');
    const rect = tableDiv!.getBoundingClientRect();
    this.showFloatingAddBtnFlag = (rect.top <= 50);
  }

  getLocations() {
    this.contactsService.getLocations().subscribe((data) => {
      if (data) {
        this.locations = this.contactsService.sortLocationByName(data);
      }
    })
  }

  getPersons() {
    this.contactsService.getPersons().subscribe((data) => {
      if (data) {
        // sort the data as per team, then field name
        this.persons = this.contactsService.sortPersonByTeamAndName(data);

        // get teams after get persons
        this.getTeams();
      }
    })
  }

  getTeams() {
    this.contactsService.getTeams().subscribe((data) => {
      if (data) {
        // update teams
        this.updateTeams(data);
      }
    })
  }

  updateTeams(data: Team[]) {
    // sort the data as per field name
    // data = this.contactsService.sortTeamByName(data);

    // add persons who are in the same team
    this.teams = this.contactsService.addPersonsUnderTeam(data, this.persons);
    this.filteredTeams = cloneDeep(this.teams);

    // if any value in searchForm, do the filter
    this.searchTeams();

    // setup team names
    this.teamNames = this.teams.map(team => team.name);

    // setup teamDls
    this.teamDls = this.teams.map(team => team.teamDl);

    // setup team remarks, when the team.remark is not empty
    this.teamRemarks = this.teams.filter(team => team.remark).map(team => team.remark);

    // update selected team members
    this.updateSelectedTeamMembers(this.selectedTeam?.id);
  }

  onTeamNameFilter(value: string) {
    this.filteredTeamNames = this.teamNames.filter(name => name.toLowerCase().includes(value?.toLowerCase()));
  }

  onTeamRemarksFilter(value: string) {
    this.filteredTeamRemarks = this.teamRemarks.filter(remark => remark.toLowerCase().includes(value?.toLowerCase()));
  }

  onTeamDlsFilter(value: string) {
    this.filteredTeamDls = this.teamDls.filter(dl => dl?.toLowerCase().includes(value?.toLowerCase()));
  }

  onSearchTeams() {
    // remove all query param and reset the url to /contacts/team
    this.navigateToTeamListing();
    setTimeout(() => {
      this.searchTeams();
    }, 100);
  }

  searchTeams(pageIndex?: number) {
    this.currentPageIndex = pageIndex ? pageIndex : 1;
    // get param teamId from URI
    const teamId = this.route.snapshot.queryParamMap.get('teamId');
    // get team by id
    const team = this.contactsService.findTeamById(this.teams, teamId as string);
    if (team) {
      this.searchForm.get('name')?.setValue(team.name);
    }
    const name = team?.name ? team?.name : this.searchForm.get('name')?.value;
    const teamDl = this.searchForm.get('teamDl')?.value;
    const remark = this.searchForm.get('remark')?.value;
    // if all are empty, set this.filderedPersons = this.persons
    if (!teamId && !name && !teamDl && !remark) {
      this.filteredTeams = this.teams;
    } else {
      this.filteredTeams = this.contactsService.filterTeams(this.teams, name as string, teamDl as string, remark as string);
    } 
    // set the filtered person count which is used for displaying in UI
    this.filteredTeamCount = this.filteredTeams.length;
    // get current page persons
    this.setCurrentPageTeams();

    // get query param viewType from URI
    const viewType = this.route.snapshot.queryParamMap.get('viewType');
    if (teamId && viewType === 'members') {
      this.viewTeamMembers(teamId);
    }
  }

  setCurrentPageTeams() {
    const start = (this.currentPageIndex - 1) * this.teamPageSize;
    const end = start + this.teamPageSize;
    this.displayTeams = this.filteredTeams.slice(start, end);
    // update displayTeams' teamDls
    // loop displayTeams, split each item's teamDl by \n, then map the trimed non-empty value in the array result to a new attribute teamDls
    this.displayTeams.forEach(team => {
      team.teamDls = team.teamDl?.split('\n').map(dl => dl.trim()).filter(dl => dl);
    });
  }

  resetSearchForm() {
    // remove all query param and reset the url to /contacts/team
    this.navigateToTeamListing();
    // reset the search form
    this.searchForm.reset();
    this.filteredTeams = this.teams;
    // set current index = 1
    this.currentPageIndex = 1;
    // get current page persons
    this.setCurrentPageTeams();
  }

  navigateToTeamListing() {
    // remove all query param and reset the url to /contacts/team
    this.urlToolService.navigateTo(`/contacts/team`, {});
  }

  clearInputName() {
    this.searchForm.get('name')?.setValue(null);
  }

  clearInputTeamDl() {
    this.searchForm.get('teamDl')?.setValue(null);
  }

  clearInputRemark() {
    this.searchForm.get('remark')?.setValue(null);
  }

  copyString(soeId: string) {
    this.stringToolService.copyToClipboard(soeId);
  }

  openTeamsWindow(soeId: string | string[]) {
    this.communicationToolService.openTeamsWindow(soeId);
  }

  openMailBox(soeId: string | string[], name?: string) {
    this.communicationToolService.openMailBox(soeId, name);
  }

  openTeamEditDrawer(teamId: string) {
    this.addOrEditMode = 'Edit';
    const team = this.contactsService.findTeamById(this.teams, teamId);
    this.selectedTeam = team ? team : new TeamEntity();
    this.validateTeamForm.setValue({
      name: this.selectedTeam.name,
      teamDl: this.selectedTeam.teamDl,
      remark: this.selectedTeam.remark
    });
    this.teamAddOrEditDrawerVisible = true;
  }

  openTeamAddDrawer() {
    this.addOrEditMode = 'Add';
    this.validateTeamForm.reset();
    this.teamAddOrEditDrawerVisible = true;
  }

  closeTeamAddOrEditDrawer() {
    this.validateTeamForm.reset();
    this.selectedTeam = new TeamEntity();
    this.teamAddOrEditDrawerVisible = false;
  }

  closeTeamMembersDrawer() {
    this.selectedTeam = new TeamEntity();
    this.teamMembersDrawerVisible = false;
  }

  submitTeamForm() {
    if (this.validateTeamForm.valid) {
      // remove all query param and reset the url to /contacts/team
      this.navigateToTeamListing();
      
      if (this.addOrEditMode === 'Edit') {
        // check if all the fields are the same with the selected team
        if (this.checkBeforeTeamUpdate()) {
          this.msg.warning('No change on team, no update required');
          return;
        }

        // update the value in backend
        const tempTeams = this.populateTeamsBeforeUpdate();
        this.contactsService.updateTeam(tempTeams);

      } else if (this.addOrEditMode === 'Add') {
        // clone a teams for sending to backend
        let tempTeams: Team[] = cloneDeep(this.teams);
        let newTeam: Team = new TeamEntity();
        newTeam.id = this.stringToolService.generateUUID();
        newTeam.name = this.validateTeamForm.get('name')?.value;
        newTeam.teamDl = this.validateTeamForm.get('teamDl')?.value;
        newTeam.remark = this.validateTeamForm.get('remark')?.value;
        tempTeams.push(newTeam);

        // remove attribute persons before sending to server
        this.removePersonsFromTeams(tempTeams)

        this.contactsService.updateTeam(tempTeams);
      }
      
      // close the drawer
      this.closeTeamAddOrEditDrawer();
    }
  }

  refreshTeamsAfterUpdate() {
    // reset validateTeamForm
    this.validateTeamForm.reset();
    // clear selectedTeam
    this.selectedTeam = new TeamEntity();
    // reload teams from backend
    this.getTeams(); 
  }

  refreshPersonsAfterUpdate() {
    // reload persons from backend
    this.getPersons(); 
  }

  checkBeforeTeamUpdate(): boolean {
    const team = this.selectedTeam;
    return team?.name === this.validateTeamForm.get('name')?.value &&
      team?.teamDl === this.validateTeamForm.get('teamDl')?.value &&
      team?.remark === this.validateTeamForm.get('remark')?.value;
  }

  populateTeamsBeforeUpdate(): Team[] {
    // clone a teams for sending to backend
    const tempTeams: Team[] = cloneDeep(this.teams);
    
    // update the team in the this.teams array
    const index = tempTeams.findIndex(t => t.id === this.selectedTeam.id);
    if (index >= 0) {
      tempTeams[index].name = this.validateTeamForm.get('name')?.value;
      tempTeams[index].teamDl = this.validateTeamForm.get('teamDl')?.value;
      tempTeams[index].remark = this.validateTeamForm.get('remark')?.value;
    }

    // remove attribute persons before sending to server
    this.removePersonsFromTeams(tempTeams)

    return tempTeams;
  }

  removePersonsFromTeams(teams: Team[]) {
    teams.forEach(t => {
      delete t.persons;
    });
  }

  deleteTeam(teamId: string) {
    // clone a teams for sending to backend
    let tempTeams: Team[] = cloneDeep(this.teams);
    tempTeams = tempTeams.filter(team => team.id !== teamId)

    // remove attribute persons before sending to server
    this.removePersonsFromTeams(tempTeams)

    this.contactsService.updateTeam(tempTeams);
  }

  viewTeamMembers(id: string) {
    // update team members
    this.updateSelectedTeamMembers(id);

    // show the drawer
    this.teamMembersDrawerVisible = true;
  }

  updateSelectedTeamMembers(id: string) {
    if (id) {
      this.selectedTeam = this.contactsService.findTeamById(this.teams, id)!;
      if (this.selectedTeam && this.selectedTeam.id) {
        // get the latest updated person 
        const updatedPerson = this.contactsService.findPersonById(this.persons, this.selectedPerson.id);
        if(updatedPerson) {
          // put the updated person in this.selectedTeam.persons
          // if there's matcing of this updated person in this.selectedTeam.persons, replace it with the updated person
          // else push the updated person in
          if (this.selectedTeam.persons?.find(person => person.id === updatedPerson?.id)) {
            this.selectedTeam.persons = this.selectedTeam.persons?.map(person => person.id === updatedPerson?.id ? updatedPerson : person);
          } else {
            this.selectedTeam.persons?.push(updatedPerson!);
          }
        }

        // update the locationName
        this.selectedTeam.persons?.forEach(person => {
          // set value for locationName
          const location = this.locations.find(location => location?.id === person?.location);
          person.locationName = location ? location?.name : '';
        });
      }
    }
  }

  submitPersonForm(person: Person) {
    // check if only soeid is changed, then if the new soeid is duplicate with others
    if (this.checkDuplicateSoeId(person.soeId)) {
      this.msg.warning('The new soeId is duplicate with others');
      return;
    }

    // populate persons for updating
    const tempPersons = this.populatePersonsBeforeUpdate(person);

    // update the value in backend
    this.contactsService.updatePerson(tempPersons);

    this.personAddOrEditDrawerVisible = {'show': false};
  }

  populatePersonsBeforeUpdate(person: Person): Person[] {
    // clone a persons for sending to backend
    const tempPersons: Person[] = cloneDeep(this.persons);
    
    if (this.addOrEditMode === 'Edit') {
      // update the person in the this.persons array
      const index = tempPersons.findIndex(p => p?.id === person?.id);
      if (index >= 0) {
        tempPersons[index].soeId = person?.soeId;
        tempPersons[index].name = person?.name;
        tempPersons[index].birthday = person?.birthday;
        tempPersons[index].team = person?.team;
        tempPersons[index].location = person?.location;
        tempPersons[index].remark = person?.remark;
      }
    } else if (this.addOrEditMode === 'Add') {
      // add the new person to the this.persons array
      tempPersons.push(person);
    }

    // remove attribute teamName before sending to server
    this.contactsService.removeTeamNameAndLocationNameFromPersons(tempPersons)

    return tempPersons;
  }

  openPersonEditDrawer(id: string) {
    this.addOrEditMode = 'Edit';

    // set the selectedPerson (selectedTeam has been setup when opening team members drawer)
    const person = this.contactsService.findPersonById(this.persons, id);
    this.selectedPerson = person ? cloneDeep(person) : cloneDeep(new PersonEntity());
    this.personAddOrEditDrawerVisible = {'show': true};
  }

  deletePerson(id: string) {
    // clone a persons for sending to backend
    let tempPersons: Person[] = cloneDeep(this.persons);
    tempPersons = tempPersons.filter(person => person.id !== id)

    // remove attribute persons before sending to server
    this.contactsService.removeTeamNameAndLocationNameFromPersons(tempPersons)

    this.contactsService.updatePerson(tempPersons);
  }

  openPersonAddDrawer() {
    this.addOrEditMode = 'Add';
    this.selectedPerson = new PersonEntity();
    this.personAddOrEditDrawerVisible = {'show': true};
  }

  checkDuplicateSoeId(soeId: string): boolean {
    if (soeId && this.selectedPerson.soeId !== soeId && this.persons.find(person => person.soeId?.toLowerCase() === soeId?.toLowerCase())) {
      return true;
    }
    return false;
  }
  
  onPageIndexChange(index: number) {
    this.currentPageIndex = index;
    this.searchTeams(index);
  }

  chatWithTeamMembers(teamId: string) {
    const team = this.contactsService.findTeamById(this.teams, teamId);
    const soeIds = team?.persons?.map(person => person.soeId) as string[];
    this.openTeamsWindow(soeIds);
  }

  mailToAllTeamMembers(teamId: string) {
    const team = this.contactsService.findTeamById(this.teams, teamId);
    const soeIds = team?.persons?.map(person => person.soeId) as string[];
    this.openMailBox(soeIds, team?.name);
  }

  viewBbContributionOfAllTeamMembers(teamId: string) {
    if(this.bbContributionUrl) {
      const team = this.contactsService.findTeamById(this.teams, teamId);
      const soeIds = team?.persons?.map(person => person.soeId) as string[];
      // format soeIds to a const of string, devided by ,
      const soeIdsString = soeIds.join(',');
      this.urlToolService.navigateTo(`${this.bbContributionUrl}`, { soeid: soeIdsString });
    }
  }

  viewBbContribution(soeId: string) {
    if(this.bbContributionUrl) {
      this.urlToolService.navigateTo(`${this.bbContributionUrl}`, { soeid: soeId });
    }
  }

  copyDl(value: string) {
    this.stringToolService.copyToClipboard(value);
  }
  
}
