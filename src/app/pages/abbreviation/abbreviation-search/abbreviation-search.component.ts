import { Component } from '@angular/core';
import { Abbreviation, AbbreviationEntity } from '../../../types/abbreviation-type';
import { BaseComponent } from '../../base/base.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AbbrevationService } from '../../../services/abbreviation/abbrevation.service';
import { SharedStoreService } from '../../../services/common/shared-store.service';
import { ActivatedRoute } from '@angular/router';
import { ABBREVIATION_SETTINGS, MODULE_NAMES } from '../../../consts/sys-consts';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { cloneDeep } from 'lodash';
import { StringToolService } from '../../../services/common/string-tool.service';
import { FileToolService } from '../../../services/common/file-tool.service';
import { UrlToolService } from '../../../services/common/url-tool.service';

@Component({
  selector: 'app-abbreviation-search',
  templateUrl: './abbreviation-search.component.html',
  styleUrls: ['./abbreviation-search.component.css']
})
export class AbbreviationSearchComponent extends BaseComponent {

  constructor(
    private abbreviationService: AbbrevationService,
    private route: ActivatedRoute,
    private msg: NzMessageService,
    public stringToolService: StringToolService,
    private sharedStoreService: SharedStoreService,
    private fileToolService: FileToolService,
    private uriToolService: UrlToolService
  ) {
    super();
    
    this.validateAbbreviationForm = new FormGroup({
      abbreviation: new FormControl('', Validators.required),
      fullName: new FormControl(''),
      remarks: new FormControl('')
    });
  }

  abbreviations: Abbreviation[] = [];
  filteredAbbreviations: Abbreviation[] = [];
  abbreviationNames: string[] = [];
  filteredAbbreviationNames: string[] = [];
  searchText: string = '';
  searchStatus: 'error' | 'warning' | '' = '';

  abbreviationUri = '/abbreviations/search';
  
  public editDrawerWidth: number = ABBREVIATION_SETTINGS.EDIT_DRAWER_WIDTH;
  public abbreviationAddOrEditDrawerVisible: boolean = false;
  addOrEditMode: 'Add' | "Edit" = 'Add';
  validateAbbreviationForm: FormGroup;
  selectedAbbreviation: Abbreviation = new AbbreviationEntity();
  abbreviationSearchLink: string = '';

  ngOnInit() {
    // get the query param searchText
    this.searchText = this.route.snapshot.queryParamMap.get('searchText') as string | '';

    // initilize the abbreviationHomePage
    this.fileToolService.loadGlobalConfigFile().subscribe((data: any) => {
      const moduleId = MODULE_NAMES.ABBREVIATIONS;
      const modules = data['apps'] || [];
      const moduleConfig =  modules.find((module: any) => module.id === moduleId);
      const abbreviationHomePage = moduleConfig?.uri || '';
      this.abbreviationSearchLink = `${abbreviationHomePage}${ABBREVIATION_SETTINGS.SEARCH_LINK}`;
    });

    // Fetch the abbreviation list from a service or API
    this.fetchAbbreviationList();

    this.sharedStoreService.getAbbreviationResultFlag().subscribe(flag => {
      if (flag) {
        this.fetchAbbreviationList();
      }
    })
  }

  fetchAbbreviationList() {
    this.abbreviationService.getAbbreviations().subscribe(data => {
      this.abbreviations = data;

      // update total count to shared store service
      this.sharedStoreService.setAbbreviationTotalCount(this.abbreviations.length);

      // update the filteredAbbreviations
      this.findByAbbreviation();
    });
  }

  findByAbbreviation() {
    // update abbreviationNames for search auto populate
    this.updateAbbreviationNames();

    if (!this.searchText || !this.searchText.trim()) {
      this.uriToolService.navigateTo(this.abbreviationUri, {});
      // clear the filtered list if search text is empty
      this.filteredAbbreviations = [];
    } else {
      // if valaue length is less than 2, then set the searchStatus to 'error', otherwise set to ''
      if (this.searchText.trim().length < 2) {
        this.searchStatus = 'error';
      } else {
        this.searchStatus = '';
        this.uriToolService.navigateTo(this.abbreviationUri, { searchText: this.searchText });
      
        // Filter the abbreviation list based on the search term
        this.filteredAbbreviations = cloneDeep(this.abbreviations.filter(abbr => abbr.abbreviation.toLowerCase().includes(this.searchText.toLowerCase())));
  
        // add link for the abbreviation words in remarks
        this.addLinksToWordsInRemark(this.filteredAbbreviations);
      }
    }
  }

  addLinksToWordsInRemark(abbreviations: Abbreviation[]): void {
    // loop abbreviations, and find the words under abbreviation.remarks which can be found in this.abbreviationNames, then add links to it
    abbreviations.forEach(abbr => {
      const breakLineRequired = true;
      abbr.remarks = this.stringToolService.addLinksToWordsInText(abbr.remarks, this.abbreviationNames, this.abbreviationSearchLink, breakLineRequired);
    });
  }

  updateAbbreviationNames() {
    this.abbreviationNames = this.abbreviations.map(abbr => abbr.abbreviation);
  }

  onSearchAbbreviationNames(value: string) {
    this.searchText = value;
    this.filteredAbbreviationNames = this.abbreviationNames.filter(name => name.toLowerCase().includes(value.toLowerCase()));

    if (value.trim().length >= 2) {
      this.searchStatus = '';
    }
  }

  clearSearchText() {
    this.uriToolService.navigateTo(this.abbreviationUri, {});
    this.searchText = '';
    this.filteredAbbreviations = [];
  }

  openAbbreviationEditDrawer(abbreviationId: string) {
    this.addOrEditMode = 'Edit';

    // find the abbreviation by id and open the drawer for editing
    this.selectedAbbreviation = this.abbreviations.find(abbr => abbr.id === abbreviationId) || new AbbreviationEntity();
    this.validateAbbreviationForm.setValue({
      abbreviation: this.selectedAbbreviation.abbreviation,
      fullName: this.selectedAbbreviation.fullName,
      remarks: this.selectedAbbreviation.remarks
    });

    // open the drawer
    this.abbreviationAddOrEditDrawerVisible = true;
  }

  openAbbreviationAddDrawer() {
    this.addOrEditMode = 'Add';
    this.validateAbbreviationForm.reset();
    this.abbreviationAddOrEditDrawerVisible = true;
  }

  closeAbbreviationAddOrEditDrawer() {
    this.validateAbbreviationForm.reset();
    this.selectedAbbreviation = new AbbreviationEntity();
    this.abbreviationAddOrEditDrawerVisible = false;
  }

  checkBeforeAbbreviationUpdate(): boolean {
    const abbreviation = this.selectedAbbreviation;
    return abbreviation?.abbreviation === this.validateAbbreviationForm.get('abbreviation')?.value &&
      abbreviation?.fullName === this.validateAbbreviationForm.get('fullName')?.value &&
      abbreviation?.remarks === this.validateAbbreviationForm.get('remarks')?.value;
  }

  checkIfAbbreviationExists(abbreviation: string): boolean {
    if (this.addOrEditMode === 'Edit') {
      // exclude this.selectedAbbreviation from the this.abbreviations
      const filteredAbbreviations = this.abbreviations.filter(abbr => abbr.id !== this.selectedAbbreviation.id);
      return filteredAbbreviations.some(abbr => abbr.abbreviation === abbreviation);
    } else if (this.addOrEditMode === 'Add') {
      return this.abbreviations.some(abbr => abbr.abbreviation === abbreviation);
    }
    return false;
    
  }

  submitAbbreviationForm() {
    if (this.validateAbbreviationForm.valid) {
      if (this.addOrEditMode === 'Edit') {
        // check if all the fields are the same with the selected abbreviation
        if (this.checkBeforeAbbreviationUpdate()) {
          this.msg.warning('No change on abbreviation, no update required');
          return;
        }

        // check if the updated abbreviation has the same name
        if (this.checkIfAbbreviationExists(this.validateAbbreviationForm.get('abbreviation')?.value)) {
          this.msg.warning('Abbreviation already exists, not able to update');
          return;
        }

        // update the value in backend
        const tempAbbreviations = this.populateAbbreviationsBeforeUpdate();
        this.abbreviationService.updateAbbreviations(tempAbbreviations);

      } else if (this.addOrEditMode === 'Add') {
        // check if the updated abbreviation has the same name
        if (this.checkIfAbbreviationExists(this.validateAbbreviationForm.get('abbreviation')?.value)) {
          this.msg.warning('Abbreviation already exists, not able to update');
          return;
        }
        
        // clone a abbreviations for sending to backend
        let tempAbbreviations: Abbreviation[] = cloneDeep(this.abbreviations);
        let newAbbreviation: Abbreviation = new AbbreviationEntity();
        newAbbreviation.id = this.stringToolService.generateUUID();
        newAbbreviation.abbreviation = this.validateAbbreviationForm.get('abbreviation')?.value;
        newAbbreviation.fullName = this.validateAbbreviationForm.get('fullName')?.value;
        newAbbreviation.remarks = this.validateAbbreviationForm.get('remarks')?.value;
        tempAbbreviations.push(newAbbreviation);

        this.abbreviationService.updateAbbreviations(tempAbbreviations);
      }
      
      // close the drawer
      this.closeAbbreviationAddOrEditDrawer();
    }
  }

  populateAbbreviationsBeforeUpdate(): Abbreviation[] {
    // clone a abbreviations for sending to backend
    const tempAbbreviations: Abbreviation[] = cloneDeep(this.abbreviations);
    
    // update the abbreviation in the this.abbreviations array
    const index = tempAbbreviations.findIndex(t => t.id === this.selectedAbbreviation.id);
    if (index >= 0) {
      tempAbbreviations[index].abbreviation = this.validateAbbreviationForm.get('abbreviation')?.value;
      tempAbbreviations[index].fullName = this.validateAbbreviationForm.get('fullName')?.value;
      tempAbbreviations[index].remarks = this.validateAbbreviationForm.get('remarks')?.value;
    }

    return tempAbbreviations;
  }

}
