import { AfterViewInit, Component, HostListener } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ContactsService } from '../../../services/contacts/contacts.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SharedStoreService } from '../../../services/common/shared-store.service';
import { UrlToolService } from '../../../services/common/url-tool.service';
import { Location, Person, PersonEntity, Team } from '../../../types/contacts-type';
import { cloneDeep, get } from 'lodash-es';
import { CONTACTS_SETTINGS, MODULE_NAMES } from '../../../consts/sys-consts';
import { StringToolService } from '../../../services/common/string-tool.service';
import { CommunicationToolService } from '../../../services/common/communication-tool.service';
import { BaseComponent } from '../../base/base.component';
import { DateService } from '../../../services/common/date.service';
import { FileToolService } from '../../../services/common/file-tool.service';
import { ToolApps } from '../../../types/home-type';

@Component({
  selector: 'app-contacts-person',
  templateUrl: './contacts-person.component.html',
  styleUrls: ['./contacts-person.component.css']
})
export class ContactsPersonComponent extends BaseComponent implements AfterViewInit {

  searchForm: FormGroup<{
    soeId: FormControl<String | null>;
    name: FormControl<String | null>;
    team: FormControl<String | null>;
    location: FormControl<String | null>;
    remark: FormControl<String | null>;
  }> = this.fb.group({
    soeId: this.fb.control<String | null>(null),
    name: this.fb.control<String | null>(null),
    team: this.fb.control<String | null>(null),
    location: this.fb.control<String | null>(null),
    remark: this.fb.control<String | null>(null)
  });

  public locations: Location[] = [];
  public persons: Person[] = [];
  public selectedPerson: Person = new PersonEntity();
  public filteredPersons: Person[] = [];
  public displayPersons: Person[] = [];
  public dropdownPersonNames: string[] = [];
  public filteredPersonNames: string[] = [];
  public dropdownPersonRemarks: string[] = [];
  public filteredPersonRemarks: string[] = [];
  public teams: Team[] = []
  public birthdayOptions: any[] = [];

  public personAddOrEditDrawerVisible: boolean = false;
  public editDrawerWidth: number = CONTACTS_SETTINGS.EDIT_DRAWER_WIDTH;

  addOrEditMode: 'Add' | "Edit" = 'Add';

  showFloatingAddBtnFlag: boolean = false;
  badgeOverflowCount: number = CONTACTS_SETTINGS.BADGE_OVERFLOW_COUNT;

  validatePersonForm: FormGroup;
  
  personPageSize: number = CONTACTS_SETTINGS.PERSON_PAGE_SIZE;
  currentPageIndex: number = 1;
  filteredPersonCount: number = 0;

  bbContributionUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    public stringToolService: StringToolService,
    public sharedStoreService: SharedStoreService,
    private urlToolService: UrlToolService,
    private contactsService: ContactsService,
    private communicationToolService: CommunicationToolService,
    private dateService: DateService,
    private fileToolService: FileToolService
  ) {
    super();

    this.validatePersonForm = new FormGroup({
      soeId: new FormControl(''),
      name: new FormControl('', Validators.required),
      birthday: new FormControl([]),
      team: new FormControl(''),
      location: new FormControl(''),
      remark: new FormControl('')
    });
  }

  ngOnInit() {
    this.getLocations();
    this.getTeams();

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
        this.bbContributionUrl = bbContributionHomePage ? bbContributionHomePage + '/commit-list' : '';
      }
    });
  }

  ngAfterViewInit() {
    // this.getPersons();
    // this.getTeams();
    this.birthdayOptions = this.dateService.generateMonthDaysObject();
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
        // sort the data as per field name
        this.locations = this.contactsService.sortLocationByName(data);
      }
    })
  }

  getPersons() {
    this.contactsService.getPersons().subscribe((data) => {
      if (data) {
        this.updatePersons(data);
      }
    })
  }

  updatePersons(data: Person[]): void {
    // sort the data as per team, then field name
    // data = this.contactsService.sortPersonByTeamAndName(data);

    // get the persons team's name, get from the this.teams which team.id === person.team
    // if not found, set team name as empty
    this.dropdownPersonNames = [];
    data.forEach(person => {
      // set value for teamName
      const team = this.teams.find(team => team.id === person.team);
      person.teamName = team ? team.name : '';

      // set value for locationName
      const location = this.locations.find(location => location.id === person.location);
      person.locationName = location ? location.name : '';

      // add its name to this.dropdownPersonNames
      if (!this.dropdownPersonNames.includes(person.name)) {
        this.dropdownPersonNames.push(person.name);
      }

      // add its remark to this.dropdownPersonRemarks
      if (person.remark && !this.dropdownPersonRemarks.includes(person.remark)) {
        this.dropdownPersonRemarks.push(person.remark);
      }
    });
    this.persons = data;
    this.filteredPersons = cloneDeep(data);
    // if any value in searchForm, do the filter
    this.onSearchPersons();
  }

  getTeams() {
    this.contactsService.getTeams().subscribe((data) => {
      if (data) {
        // sort the data as per field name
        // data = this.contactsService.sortTeamByName(data);
        this.teams = data;
        this.getPersons();
      }
    })
  }

  copyString(soeId: string) {
    this.stringToolService.copyToClipboard(soeId);
  }

  openTeamsWindow(soeId: string) {
    this.communicationToolService.openTeamsWindow(soeId);
  }

  openMailBox(soeId: string, name?: string) {
    this.communicationToolService.openMailBox(soeId, name);
  }

  onPersonNameFilter(value: string): void {
    this.filteredPersonNames = this.dropdownPersonNames.filter(option => option.toLowerCase().indexOf(value?.toLowerCase()) !== -1);
  }

  onPersonRemarkFilter(value: string): void {
    this.filteredPersonRemarks = this.dropdownPersonRemarks.filter(option => option.toLowerCase().indexOf(value?.toLowerCase()) !== -1);
  }

  onSearchPersons(pageIndex?: number): void {
    this.currentPageIndex = pageIndex ? pageIndex : 1;
    const soeId = this.searchForm.get('soeId')?.value;
    const name = this.searchForm.get('name')?.value;
    const team = this.searchForm.get('team')?.value;
    const location = this.searchForm.get('location')?.value;
    const remark = this.searchForm.get('remark')?.value;
    // if all are empty, set this.filderedPersons = this.persons
    if (!soeId && !name && !team && !location && !remark) {
      this.filteredPersons = this.persons;
    } else {
      this.filteredPersons = this.contactsService.filterPersons(this.persons, soeId as string, name as string, team as string, location as string, remark as string);
    }
    // set the filtered person count which is used for displaying in UI
    this.filteredPersonCount = this.filteredPersons.length;
    // get current page persons
    this.setCurrentPagePersons();
  }

  setCurrentPagePersons(): void {
    const start = (this.currentPageIndex - 1) * this.personPageSize;
    const end = start + this.personPageSize;
    this.displayPersons = this.filteredPersons.slice(start, end);
  }

  resetSearchForm() {
    this.searchForm.reset();
    this.filteredPersons = this.persons;
    // set current index = 1
    this.currentPageIndex = 1;
    // get current page persons
    this.setCurrentPagePersons();
  }

  clearInputName() {
    this.searchForm.get('name')?.setValue('');
  }

  clearInputRemark() {
    this.searchForm.get('remark')?.setValue('');
  }

  openPersonEditDrawer(id: string) {
    this.addOrEditMode = 'Edit';
    const person = this.contactsService.findPersonById(this.persons, id);
    this.selectedPerson = person ? person : new PersonEntity();
    this.validatePersonForm.setValue({
      soeId: this.selectedPerson.soeId,
      name: this.selectedPerson.name,
      birthday: this.selectedPerson.birthday || [],
      team: this.selectedPerson.team,
      location: this.selectedPerson.location,
      remark: this.selectedPerson.remark
    });
    this.personAddOrEditDrawerVisible = true;
  }

  openPersonAddDrawer() {
    this.addOrEditMode = 'Add';
    this.validatePersonForm.reset();
    this.personAddOrEditDrawerVisible = true;
  }

  closePersonAddOrEditDrawer() {
    this.validatePersonForm.reset();
    this.selectedPerson = new PersonEntity();
    this.personAddOrEditDrawerVisible = false;
  }

  submitPersonForm() {
    if (this.validatePersonForm.valid) {
      if (this.addOrEditMode === 'Edit') {
        // check if all the fields are the same with the selected person
        if (this.checkIfNoChangeInForm()) {
          this.msg.warning('No change on person, no update required');
          return;
        }

        // check if only soeid is changed, then if the new soeid is duplicate with others
        if (this.checkDuplicateSoeId()) {
          this.msg.warning('The new soeId is duplicate with others');
          return;
        }

        // update the value in backend
        const tempPersons = this.populatePersonsBeforeUpdate();
        this.contactsService.updatePerson(tempPersons);

      } else if (this.addOrEditMode === 'Add') {
        // check if only soeid is changed, then if the new soeid is duplicate with others
        if (this.checkDuplicateSoeId()) {
          this.msg.warning('The new soeId is duplicate with others');
          return;
        }

        // clone a persons for sending to backend
        let tempPersons: Person[] = cloneDeep(this.persons);
        let newPerson: Person = new PersonEntity();
        newPerson.id = this.stringToolService.generateUUID();
        newPerson.soeId = this.validatePersonForm.get('soeId')?.value;
        newPerson.name = this.validatePersonForm.get('name')?.value;
        newPerson.birthday = this.validatePersonForm.get('birthday')?.value;
        newPerson.team = this.validatePersonForm.get('team')?.value;
        newPerson.location = this.validatePersonForm.get('location')?.value;
        newPerson.remark = this.validatePersonForm.get('remark')?.value;
        tempPersons.push(newPerson);

        // remove attribute teamName & locationName before sending to server
        this.removeTeamNameAndLocationNameFromPersons(tempPersons)

        this.contactsService.updatePerson(tempPersons);
      }
      
      // close the drawer
      this.closePersonAddOrEditDrawer();
    }
  }

  refreshPersonsAfterUpdate() {
    // reset validatePersonForm
    this.validatePersonForm.reset();
    // clear selectedPerson
    this.selectedPerson = new PersonEntity();
    // reload persons from backend
    this.getPersons(); 
  }

  checkIfNoChangeInForm(): boolean {
    const person = this.selectedPerson;
    return person?.soeId === this.validatePersonForm.get('soeId')?.value &&
      person?.name === this.validatePersonForm.get('name')?.value &&
      person?.birthday === this.validatePersonForm.get('birthday')?.value &&
      person?.team === this.validatePersonForm.get('team')?.value &&
      person?.location === this.validatePersonForm.get('location')?.value &&
      person?.remark === this.validatePersonForm.get('remark')?.value;
  }

  checkDuplicateSoeId(): boolean {
    const soeId = this.validatePersonForm.get('soeId')?.value;
    if (soeId && this.selectedPerson.soeId !== soeId && this.persons.find(person => person.soeId?.toLowerCase() === soeId?.toLowerCase())) {
      return true;
    }
    return false;
  }

  populatePersonsBeforeUpdate(): Person[] {
    // clone a persons for sending to backend
    const tempPersons: Person[] = cloneDeep(this.persons);
    
    // update the person in the this.persons array
    const index = tempPersons.findIndex(p => p?.id === this.selectedPerson?.id);
    if (index >= 0) {
      tempPersons[index].soeId = this.validatePersonForm.get('soeId')?.value;
      tempPersons[index].name = this.validatePersonForm.get('name')?.value;
      tempPersons[index].birthday = this.validatePersonForm.get('birthday')?.value;
      tempPersons[index].team = this.validatePersonForm.get('team')?.value;
      tempPersons[index].location = this.validatePersonForm.get('location')?.value;
      tempPersons[index].remark = this.validatePersonForm.get('remark')?.value;
    }

    // remove attribute teamName before sending to server
    this.removeTeamNameAndLocationNameFromPersons(tempPersons)

    return tempPersons;
  }

  removeTeamNameAndLocationNameFromPersons(persons: Person[]) {
    //remove attribute teamName
    persons.forEach(person => {
      delete person.teamName;
      delete person.locationName;
    });
  }

  deletePerson(id: string) {
    // clone a persons for sending to backend
    let tempPersons: Person[] = cloneDeep(this.persons);
    tempPersons = tempPersons.filter(person => person.id !== id)

    // remove attribute persons before sending to server
    this.removeTeamNameAndLocationNameFromPersons(tempPersons)

    this.contactsService.updatePerson(tempPersons);
  }

  exportPersonToExcel() {
    this.contactsService.exportPersonToExcel();
  }

  viewTeamInfo(teamId: string) {
    this.urlToolService.navigateTo(`/contacts/team/`, { teamId: teamId });
    this.sharedStoreService.setContactsTabValue('team');
  }

  viewTeamMembers(teamId: string) {
    this.urlToolService.navigateTo(`/contacts/team/`, { teamId: teamId, viewType: 'members' });
    this.sharedStoreService.setContactsTabValue('team');
  }

  onPageIndexChange(index: number) {
    this.currentPageIndex = index;
    this.onSearchPersons(index);
  }

  viewBbContribution(soeId: string) {
    if(this.bbContributionUrl) {
      this.urlToolService.navigateTo(`${this.bbContributionUrl}`, { soeId: soeId });
    }
  }

}
