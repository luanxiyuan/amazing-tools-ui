import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '../../base/base.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UrlToolService } from '../../../services/common/url-tool.service';
import { ActivatedRoute } from '@angular/router';
import { API_TREE_SETTINGS, HTTP_METHODS, API_CLASSIFICATIONS, API_BELONGS_TO_APPLICATIONS, API_STATUSES, API_BASE_URL, IMAGE_FAILBACK, URI_SEARCH_MODES } from '../../../consts/sys-consts';
import { OpenAndPrivateApi, OpenAndPrivateApiEntity, BelongsToApplication, OpenAndPrivateApiUIObj } from '../../../types/api-tree-type';
import { ApiTreeService } from '../../../services/api-tree/api-tree.service';
import { Application } from '../../../types/home-type';
import { SharedStoreService } from '../../../services/common/shared-store.service';
import { Subject, debounceTime } from 'rxjs';
import { cloneDeep } from 'lodash-es';
import { UiApiRelation } from '../../../types/ui-marker-type';

@Component({
  selector: 'app-api-list',
  templateUrl: './api-list.component.html',
  styleUrls: ['./api-list.component.css']
})
export class ApiListComponent extends BaseComponent {

  public filteredUriNames: string[] = [];
  public filteredRemarks: string[] = [];

  addOrEditMode: 'Add' | "Edit" = 'Add';
  public apiAddOrEditDrawerVisible: boolean = false;
  public addSubApiDrawerVisible: boolean = false;
  public uiApiRelationDrawerVisible: boolean = false;
  public editDrawerWidth: number = API_TREE_SETTINGS.EDIT_DRAWER_WIDTH;
  public subApiAddDrawerWidth: number = API_TREE_SETTINGS.SUB_API_ADD_DRAWER_WIDTH;
  public uiApiRelationDrawerWidth: number = API_TREE_SETTINGS.UI_API_RELATION_DRAWER_WIDTH;
  public selectedOpenAndPrivateApi: OpenAndPrivateApi = new OpenAndPrivateApiEntity();
  public httpMethods: string[] = HTTP_METHODS;
  public applications: Application[] = [];
  public openAndPrivateApis: OpenAndPrivateApi[] = [];
  public filteredOpenAndPrivateApis: OpenAndPrivateApi[] = [];
  public searchDropdownOpenAndPrivateApis: OpenAndPrivateApi[] = [];
  public groupedDropdownOpenAndPrivateApis: Map<string, OpenAndPrivateApi[]> = new Map<string, OpenAndPrivateApi[]>();
  public displayOpenAndPrivateApis: OpenAndPrivateApiUIObj[] = [];
  public classifications = API_CLASSIFICATIONS;
  public belongsToApplications: BelongsToApplication[] = API_BELONGS_TO_APPLICATIONS;
  public apiStatuses: string[] = API_STATUSES;
  public channels: string[] = [];
  public regionsOrCountries: string[] = [];
  public filterChannelDisabled: boolean = true;
  public drawerChannelDisabled: boolean = true;
  public drawerRegionOrCountryDisabled: boolean = true;
  public currentSubApis: OpenAndPrivateApi[] = [];
  public selectedSubApiId: string = '';
  private searchSubject = new Subject<string>();
  private searchSubscription: any;
  public uiApiRelations: UiApiRelation[] = [];
  public imageBaseUrl: string = API_BASE_URL;
  public fallback: string = IMAGE_FAILBACK;
  public uriSearchModes = URI_SEARCH_MODES;

  openAndPrivateApiPageSize: number = API_TREE_SETTINGS.API_PAGE_SIZE;
  currentPageIndex: number = 1;
  filteredOpenAndPrivateApiCount: number = 0;
  badgeOverflowCount: number = API_TREE_SETTINGS.BADGE_OVERFLOW_COUNT;

  validateApiForm: FormGroup;

  searchForm: FormGroup<{
    uri: FormControl<String | null>;
    uriSearchMode: FormControl<String | null>;
    httpMethod: FormControl<String | null>;
    classification: FormControl<String | null>;
    belongsToApplication: FormControl<string | null>;
    channel: FormControl<String | null>;
    swaggerTitle: FormControl<String | null>;
    apiName: FormControl<String | null>;
  }> = this.fb.group({
    uri: this.fb.control<String | null>(null),
    uriSearchMode: this.fb.control<String | null>(null),
    httpMethod: this.fb.control<String | null>(null),
    classification: this.fb.control<String | null>(null),
    belongsToApplication: this.fb.control<string | null>(null),
    channel: this.fb.control<String | null>(null),
    swaggerTitle: this.fb.control<String | null>(null),
    apiName: this.fb.control<String | null>(null)
  });

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private urlToolService: UrlToolService,
    private route: ActivatedRoute,
    private apiTreeService: ApiTreeService,
    private sharedStoreService: SharedStoreService
  ) {
    super();

    this.validateApiForm = new FormGroup({
      id: new FormControl(''),
      swaggerTitle: new FormControl(''),
      serviceName: new FormControl(''),
      channel: new FormControl(''),
      bianBehaviorQualifier: new FormControl(''),
      subQualifier: new FormControl(''),
      regionOrCountry: new FormControl(''),
      apiName: new FormControl(''),
      httpMethod: new FormControl('', Validators.required),
      uri: new FormControl('', Validators.required),
      classification: new FormControl('', Validators.required),
      bianAdoptionLevel: new FormControl(''),
      belongsToApplication: new FormControl([]),
      apiStatus: new FormControl(''),
      subIds: new FormControl([]),
      remark: new FormControl('')
    });
  }

  ngOnInit() {
    // get the query param from url and patch them in searchForm
    // this is the the case when user refresh the page or directly access the page with query params
    this.getQueryParamFromUrl();

    // get open api list
    this.getOpenAndPrivateApis();

    this.sharedStoreService.getOpenAndPrivateApiUpdateResultFlag().subscribe((flag: boolean) => {
      if (flag) {
        // get latest open api list
        this.getOpenAndPrivateApis();
        // close the drawer
        this.closeApiAddOrEditDrawer();
      }
    });

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400)
    ).subscribe(uri => {
      if (uri) {
        this.onSearchSubApiDropdownApis(uri);
      }
    });

    this.sharedStoreService.getUiApiRelationData().subscribe((data: UiApiRelation[]) => {
      this.uiApiRelations = data;
      if (data.length > 0) {
        this.uiApiRelationDrawerVisible = true;
      }
    });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.searchSubscription.unsubscribe();
  }

  getOpenAndPrivateApis() {
    this.apiTreeService.getOpenAndPrivateApis().subscribe((data: any) => {
      this.openAndPrivateApis = data;
      this.searchOpenAndPrivateApis(this.currentPageIndex);
    });
  }

  onSearchApis() {
    setTimeout(() => {
      this.searchOpenAndPrivateApis();
    }, 10);
  }

  getQueryParamFromUrl() {
    const uri: string = this.route.snapshot.queryParams['uri'];
    const uriSearchMode = this.route.snapshot.queryParams['uriSearchMode'];
    const httpMethod: string = this.route.snapshot.queryParams['httpMethod'];
    const classification: string = this.route.snapshot.queryParams['classification'];
    const belongsToApplication: string = this.route.snapshot.queryParams['belongsToApplication'];
    if (belongsToApplication) {
      this.onBelongsToApplicationFilter(belongsToApplication);
    }
    const channel: string = this.route.snapshot.queryParams['channel'];
    const swaggerTitle: string = this.route.snapshot.queryParams['swaggerTitle'];
    const apiName: string = this.route.snapshot.queryParams['apiName'];

    this.searchForm.patchValue({
      uri: uri ? uri : null,
      uriSearchMode: uriSearchMode ? uriSearchMode : this.uriSearchModes[0],
      httpMethod: httpMethod ? httpMethod : null,
      classification: classification ? classification : null,
      belongsToApplication: belongsToApplication ? belongsToApplication : null,
      channel: channel ? channel : null,
      swaggerTitle: swaggerTitle ? swaggerTitle : null,
      apiName: apiName ? apiName : null
    });
  }

  searchOpenAndPrivateApis(pageIndex?: number) {
    this.currentPageIndex = pageIndex ? pageIndex : 1;
    const uri: string = this.searchForm.get('uri')?.value as string;
    const uriSearchMode: string = this.searchForm.get('uriSearchMode')?.value as string;
    const httpMethod: string = this.searchForm.get('httpMethod')?.value as string;
    const classification = this.searchForm.get('classification')?.value as string;
    const belongsToApplication = this.searchForm.get('belongsToApplication')?.value as string;
    const channel = this.searchForm.get('channel')?.value as string;
    const swaggerTitle = this.searchForm.get('swaggerTitle')?.value as string;
    const apiName = this.searchForm.get('apiName')?.value as string;
    // if all are empty, set this.filderedPersons = this.persons
    if (!uri && !httpMethod && !classification && !belongsToApplication && !channel && !swaggerTitle && !apiName) {
      this.filteredOpenAndPrivateApis = this.openAndPrivateApis;
    } else {
      this.filteredOpenAndPrivateApis = this.apiTreeService.filterOpenAndPrivateApis(
        this.openAndPrivateApis, 
        uri,
        uriSearchMode,
        httpMethod, 
        classification, 
        belongsToApplication, 
        channel, 
        swaggerTitle, 
        apiName);
    } 
    // set the filtered open api count which is used for displaying in UI
    this.filteredOpenAndPrivateApiCount = this.filteredOpenAndPrivateApis.length;
    // get current page open Apis
    this.setCurrentPageOpenAndPrivateApis();

    // update query params in url, if the value is not empty
    this.populateQueryParams();
  }

  setCurrentPageOpenAndPrivateApis() {
    const start = (this.currentPageIndex - 1) * this.openAndPrivateApiPageSize;
    const end = start + this.openAndPrivateApiPageSize;
    const tempPageOpenAndPrivateApis = this.filteredOpenAndPrivateApis.slice(start, end);

    // clone the this.displayOpenAndPrivateApis as previous state
    const previousDisplayOpenAndPrivateApis = cloneDeep( this.displayOpenAndPrivateApis);

    // add value false for each item's field expendFlag in tempPageOpenAndPrivateApis, and put it in displayOpenAndPrivateApis
    this.displayOpenAndPrivateApis = tempPageOpenAndPrivateApis.map(api => {
      // if api.id can be found in previousDisplayOpenAndPrivateApis, get its expendFlag
      // This is for keeping the expendFlag value when the page value is changed
      const expendFlag = previousDisplayOpenAndPrivateApis.find(previousApi => previousApi.id === api.id)?.expendFlag || false;
      // if expendFlag is true, get the subApis
      let subApis: OpenAndPrivateApi[] = [];
      if (expendFlag) {
        const subIds = api.subIds || [];
        subApis = this.openAndPrivateApis.filter(subApi => subIds.includes(subApi.id));
      }
      return {
        ...api,
        expendFlag: expendFlag,
        subApis: subApis
      };
    });
  }

  populateQueryParams() {
    const uri: string = this.searchForm.get('uri')?.value as string;
    const uriSearchMode: string = this.searchForm.get('uriSearchMode')?.value as string;
    const httpMethod: string = this.searchForm.get('httpMethod')?.value as string;
    const classification = this.searchForm.get('classification')?.value as string;
    const belongsToApplication = this.searchForm.get('belongsToApplication')?.value as string;
    const channel = this.searchForm.get('channel')?.value as string;
    const swaggerTitle = this.searchForm.get('swaggerTitle')?.value as string;
    const apiName = this.searchForm.get('apiName')?.value as string;
    // update query params in url, if the value is not empty
    const queryParams: {[key: string]: string} = {};
    if (uri) {
      queryParams['uri'] = uri;
    }
    if (uriSearchMode) {
      queryParams['uriSearchMode'] = uriSearchMode ? uriSearchMode : this.uriSearchModes[0];
    }
    if (httpMethod) {
      queryParams['httpMethod'] = httpMethod;
    }
    if (classification) {
      queryParams['classification'] = classification;
    }
    if (belongsToApplication) {
      queryParams['belongsToApplication'] = belongsToApplication;
    }
    if (channel) {
      queryParams['channel'] = channel;
    }
    if (swaggerTitle) {
      queryParams['swaggerTitle'] = swaggerTitle;
    }
    if (apiName) {
      queryParams['apiName'] = apiName;
    }

    this.urlToolService.updateUrlQueryParams(queryParams);
  }

  onPageIndexChange(index: number) {
    this.currentPageIndex = index;
    this.searchOpenAndPrivateApis(index);
  }

  resetSearchForm() {
    this.searchForm.reset();
    this.searchForm.patchValue({
      uriSearchMode: this.uriSearchModes[0],
    });

    this.filteredOpenAndPrivateApis = this.openAndPrivateApis;
    // set current index = 1
    this.currentPageIndex = 1;
    // get current page persons
    this.setCurrentPageOpenAndPrivateApis();
    // remove all the query params in url
    this.populateQueryParams();
  }

  clearInputUri() {
    this.searchForm.get('uri')?.setValue(null);
  }

  clearInputHttpMethod() {
    this.searchForm.get('httpMethod')?.setValue(null);
  }

  clearInputApiType() {
    this.searchForm.get('classification')?.setValue(null);
  }
  
  startOpenAndPrivateApiAddDrawer(classification?: string) {
    this.addOrEditMode = 'Add';
    this.validateApiForm.reset();
    // set a default value for http method, classification, belongs to application, apiStatus
    this.validateApiForm.patchValue({'httpMethod': this.httpMethods[0]});
    this.validateApiForm.patchValue({'classification': classification ? classification : this.classifications[0]});
    this.validateApiForm.patchValue({'belongsToApplication': this.belongsToApplications[0].name});
    this.validateApiForm.patchValue({'apiStatus': this.apiStatuses[0]});
    // set the default value for region and channel
    this.onBelongsToApplicationsChange(this.belongsToApplications[0].name);

    this.apiAddOrEditDrawerVisible = true;
  }

  startAddSubApiDrawer(apiEntity: OpenAndPrivateApi) {
    this.selectedOpenAndPrivateApi = apiEntity;
    // get all the subIds of the selected api
    const subIds: string[] = this.openAndPrivateApis.find(api => api.id === apiEntity.id)?.subIds || [];
    // set this.currentSubApis using subIds
    this.currentSubApis = this.openAndPrivateApis.filter(api => subIds.includes(api.id));
    // open the drawer
    this.addSubApiDrawerVisible = true;

    this.initiateSubApiDropdownOptions(apiEntity);
  }

  initiateSubApiDropdownOptions(apiEntity: OpenAndPrivateApi) {
    this.selectedSubApiId = '';

    // filter the non-open api, with the same classification
    this.searchDropdownOpenAndPrivateApis = this.filterSubApiDropdownApis(apiEntity);
    // group the filtered apis by channel
    this.groupedDropdownOpenAndPrivateApis = new Map<string, OpenAndPrivateApi[]>();
  }

  onSearchSubApiDropdownApis(uri: string) {
    // filter the dropdown apis by uri
    // in case the uri has the variable in the path, such as /v1/investments/mutualFunds/{0}/settlementAccounts, please match {0} to anything such as {accountid} or something
    let tempSearchDropdownOpenAndPrivateApis = cloneDeep(this.searchDropdownOpenAndPrivateApis);
    if (uri) {
      tempSearchDropdownOpenAndPrivateApis = this.searchDropdownOpenAndPrivateApis.filter(api => 
        this.urlToolService.partialMatchUriWithVariables(uri, api.uri)
      );
    }
    // group the dropdown apis by channel
    this.groupedDropdownOpenAndPrivateApis = this.groupOpenAndPrivateApiByChannel(tempSearchDropdownOpenAndPrivateApis);
  }

  onSearchSubApiInputChange(uri: string) {
    this.searchSubject.next(uri);
  }

  filterSubApiDropdownApis(apiEntity: OpenAndPrivateApi): OpenAndPrivateApi[] {
    this.searchDropdownOpenAndPrivateApis = [];
    // filter the non-open api, with the same classification
    // filter out current API id from this.searchDropdownOpenAndPrivateApi
    return this.openAndPrivateApis
      // .filter(api => api.classification !== API_CLASSIFICATIONS[0] && api.classification === apiEntity.classification)
      .filter(api => api.id !== apiEntity.id);
  }

  groupOpenAndPrivateApiByChannel(openAndPrivateApis: OpenAndPrivateApi[]) {
    const channelMap = new Map<string, OpenAndPrivateApi[]>();
    openAndPrivateApis.forEach(api => {
      const channelName = api.channel ? api.channel : 'Z_OTHERS'
      if (channelMap.has(channelName)) {
        channelMap.get(channelName)?.push(api);
      } else {
        channelMap.set(channelName, [api]);
      }
    });
    return channelMap;
  }

  startOpenAndPrivateApiEditDrawer(apiEntity: OpenAndPrivateApi) {
    this.addOrEditMode = 'Edit';
    this.selectedOpenAndPrivateApi = apiEntity;
    this.onBelongsToApplicationsChange(this.selectedOpenAndPrivateApi.belongsToApplication);
    this.validateApiForm.setValue({
      id: this.selectedOpenAndPrivateApi.id,
      uri: this.selectedOpenAndPrivateApi.uri,
      swaggerTitle: this.selectedOpenAndPrivateApi.swaggerTitle,
      serviceName: this.selectedOpenAndPrivateApi.serviceName,
      apiName: this.selectedOpenAndPrivateApi.apiName,
      httpMethod: this.selectedOpenAndPrivateApi.httpMethod,
      classification: this.selectedOpenAndPrivateApi.classification,
      belongsToApplication: this.selectedOpenAndPrivateApi.belongsToApplication,
      channel: this.selectedOpenAndPrivateApi.channel,
      regionOrCountry: this.selectedOpenAndPrivateApi.regionOrCountry,
      bianBehaviorQualifier: this.selectedOpenAndPrivateApi.bianBehaviorQualifier,
      subQualifier: this.selectedOpenAndPrivateApi.subQualifier,
      bianAdoptionLevel: this.selectedOpenAndPrivateApi.bianAdoptionLevel,
      apiStatus: this.selectedOpenAndPrivateApi.apiStatus,
      subIds: this.selectedOpenAndPrivateApi.subIds,
      remark: this.selectedOpenAndPrivateApi.remark
    });
    this.apiAddOrEditDrawerVisible = true;
  }

  closeApiAddOrEditDrawer() {
    this.validateApiForm.reset();
    this.apiAddOrEditDrawerVisible = false;
  }

  closeAddSubApiDrawer() {
    this.addSubApiDrawerVisible = false;
  }

  closeUiApiRelationDrawer() {
    this.uiApiRelationDrawerVisible = false;
    this.sharedStoreService.setUiApiRelationData([]);
  }

  submitApiForm() {
    if (this.validateApiForm.valid) {
      if (this.addOrEditMode === 'Edit') {
        // check if all the fields are the same with the selected team
        if (this.checkBeforeApiUpdate()) {
          this.msg.warning('No change on API, no update required');
          return;
        }
        // update the API details
        const newOpenAndPrivateApi = this.populateApiEntityForAddOrUpdate(this.selectedOpenAndPrivateApi);
        this.apiTreeService.updateOpenAndPrivateApi(newOpenAndPrivateApi);
      } else if (this.addOrEditMode === 'Add') {
        const newOpenAndPrivateApi = this.populateApiEntityForAddOrUpdate(new OpenAndPrivateApiEntity());
        this.apiTreeService.addOpenAndPrivateApi(newOpenAndPrivateApi);
      }
    }
  }

  populateApiEntityForAddOrUpdate(newOpenAndPrivateApi: OpenAndPrivateApi): OpenAndPrivateApi {
    newOpenAndPrivateApi.swaggerTitle = this.validateApiForm.get('swaggerTitle')?.value;
    newOpenAndPrivateApi.serviceName = this.validateApiForm.get('serviceName')?.value;
    newOpenAndPrivateApi.bianBehaviorQualifier = this.validateApiForm.get('bianBehaviorQualifier')?.value;
    newOpenAndPrivateApi.subQualifier = this.validateApiForm.get('subQualifier')?.value;
    newOpenAndPrivateApi.channel = this.validateApiForm.get('channel')?.value;
    newOpenAndPrivateApi.regionOrCountry = this.validateApiForm.get('regionOrCountry')?.value;
    newOpenAndPrivateApi.apiName = this.validateApiForm.get('apiName')?.value;
    newOpenAndPrivateApi.httpMethod = this.validateApiForm.get('httpMethod')?.value;
    newOpenAndPrivateApi.uri = this.validateApiForm.get('uri')?.value;
    newOpenAndPrivateApi.classification = this.validateApiForm.get('classification')?.value;
    newOpenAndPrivateApi.bianAdoptionLevel = this.validateApiForm.get('bianAdoptionLevel')?.value;
    newOpenAndPrivateApi.apiStatus = this.validateApiForm.get('apiStatus')?.value;
    newOpenAndPrivateApi.belongsToApplication = this.validateApiForm.get('belongsToApplication')?.value;
    newOpenAndPrivateApi.remark = this.validateApiForm.get('remark')?.value;

    return newOpenAndPrivateApi;
  }

  checkBeforeApiUpdate(): boolean {
    return this.selectedOpenAndPrivateApi?.swaggerTitle === this.validateApiForm.get('swaggerTitle')?.value &&
      this.selectedOpenAndPrivateApi?.serviceName === this.validateApiForm.get('serviceName')?.value &&
      this.selectedOpenAndPrivateApi?.bianBehaviorQualifier === this.validateApiForm.get('bianBehaviorQualifier')?.value &&
      this.selectedOpenAndPrivateApi?.subQualifier === this.validateApiForm.get('subQualifier')?.value &&
      this.selectedOpenAndPrivateApi?.channel === this.validateApiForm.get('channel')?.value &&
      // this.selectedOpenAndPrivateApi?.regionOrCountry === this.validateApiForm.get('regionOrCountry')?.value &&
      this.selectedOpenAndPrivateApi?.apiName === this.validateApiForm.get('apiName')?.value &&
      this.selectedOpenAndPrivateApi?.httpMethod === this.validateApiForm.get('httpMethod')?.value &&
      this.selectedOpenAndPrivateApi?.uri === this.validateApiForm.get('uri')?.value &&
      this.selectedOpenAndPrivateApi?.classification === this.validateApiForm.get('classification')?.value &&
      this.selectedOpenAndPrivateApi?.bianAdoptionLevel === this.validateApiForm.get('bianAdoptionLevel')?.value &&
      this.selectedOpenAndPrivateApi?.apiStatus === this.validateApiForm.get('apiStatus')?.value &&
      this.selectedOpenAndPrivateApi?.belongsToApplication === this.validateApiForm.get('belongsToApplication')?.value &&
      this.selectedOpenAndPrivateApi?.remark === this.validateApiForm.get('remark')?.value;
  }

  onBelongsToApplicationFilter(value: string) {
    // get the channels under this application
    const app = this.belongsToApplications.find(app => app.name === value);
    this.channels = app ? app.channels : [];
    // if this.channels's length > 0, set the filterChannelDisabled to false
    this.filterChannelDisabled = this.channels.length > 0 ? false : true;
    // remove the searchForm value
    this.searchForm.patchValue({'channel': null});
  }

  onBelongsToApplicationsChange(value: string) {
    // get the channels under this application
    const app = this.belongsToApplications.find(app => app.name === value);

    // clear the original selected values
    this.validateApiForm.patchValue({'channel': null});
    this.channels = app ? app.channels : [];
    // if this.channels's length > 0, set the drawerChannelDisabled to false
    this.drawerChannelDisabled = this.channels.length > 0 ? false : true;

    // clear the original selected values
    this.validateApiForm.patchValue({'regionOrCountry': null});
    this.regionsOrCountries = app ? app.regions : [];
    // if this.regionsOrCountries's length > 0, set the drawerRegionOrCountryDisabled to false
    this.drawerRegionOrCountryDisabled = this.regionsOrCountries.length > 0 ? false : true;
  }

  clearInputSwaggerTitle() {
    this.searchForm.get('swaggerTitle')?.setValue(null);
  }

  clearInputApiName() {
    this.searchForm.get('apiName')?.setValue(null);
  }

  deleteOpenAndPrivateApiById(id: string) {
    // delete open Api by Id
    this.apiTreeService.deleteOpenAndPrivateApiById(id);
  }

  onExpandChange(id: string, value: boolean) {
    // get the subIds of the selected api
    const subIds = this.openAndPrivateApis.find(api => api.id === id)?.subIds || [];
    // get the subApis of the selected api
    const subApis = this.openAndPrivateApis.filter(api => subIds.includes(api.id));

    this.displayOpenAndPrivateApis = this.displayOpenAndPrivateApis.map(api => {
      if (api.id === id) {
        api.subApis = subApis;
        api.expendFlag = value;
      }
      return api;
    });
  }

  openApiLink(uri: string, method: string) {
    if (uri) {
      // if uri ends with /, remove it
      uri = uri.endsWith('/') ? uri.slice(0, -1) : uri;
      // open a new window with params uri and method as query param uri and httpMethod
      this.urlToolService.navigateTo('/api-tree/api-list', {uri, httpMethod: method});
    }
  }

  startOpenAndPrivateApiAddDrawer2() {
    this.closeSubApiAddDrawer();
    this.startOpenAndPrivateApiAddDrawer(this.classifications[1]);
  }

  closeSubApiAddDrawer() {
    this.addSubApiDrawerVisible = false;
  }

  addSubApiRecord() {
    const subApi = this.searchDropdownOpenAndPrivateApis.find(api => api.id === this.selectedSubApiId);
    if (subApi) {
      // check if this.selectedSubApiId exists in currentSubApis, if no, add it
      if (!this.currentSubApis.find(api => api.id === this.selectedSubApiId)) {
        this.currentSubApis.push(subApi);
      } else {
        this.msg.warning('The selected API already exists in current Sub APIs');
      }
    } else {
      this.msg.warning('Cannot find the selected API\'s data');
    }
  }

  removeSubApiRecord(subApiId: string) {
    // remove the subApiId from the currentSubApis
    this.currentSubApis = this.currentSubApis.filter(api => api.id !== subApiId);
  }

  submitSubApiAddForm() {
    // get the subIds of the current API
    const subIds = this.currentSubApis.map(api => api.id);
    // update the subIds of the current API
    this.apiTreeService.updateSubIdsOfOpenAndPrivateApi(this.selectedOpenAndPrivateApi.id, subIds);
  }

  deleteSubApiById(parentId: string, subApiId: string) {
    // delete the subApi by id
    this.apiTreeService.deleteSubApiById(parentId, subApiId);
  }

  exportOpenAndPrivateApiToExcel() {
    // get current searchForm non-empty values
    const uri: string = this.searchForm.get('uri')?.value as string;
    const uriSearchMode: string = this.searchForm.get('uriSearchMode')?.value as string || this.uriSearchModes[0];
    const httpMethod: string = this.searchForm.get('httpMethod')?.value as string;
    const classification = this.searchForm.get('classification')?.value as string;
    const belongsToApplication = this.searchForm.get('belongsToApplication')?.value as string;
    const channel = this.searchForm.get('channel')?.value as string;
    const swaggerTitle = this.searchForm.get('swaggerTitle')?.value as string;
    const apiName = this.searchForm.get('apiName')?.value as string;
    // pass the params by calling API to get the excel file
    this.apiTreeService.exportOpenAndPrivateApiToExcel(uri, uriSearchMode, httpMethod, classification, belongsToApplication, channel, swaggerTitle, apiName);
  }

  startViewApiPagesDrawer(apiEntity: OpenAndPrivateApi) {
    this.selectedOpenAndPrivateApi = apiEntity;

    // get the ui api relation data
    this.apiTreeService.getUiApiRelationData(apiEntity.uri, apiEntity.httpMethod);
  }

  goToViewApiUiMarkerFormDetails(relationData: UiApiRelation) {
    // get the params from relationData
    const applicationId = relationData.appId;
    const moduleId = relationData.moduleId;
    const functionId = relationData.funId;
    const pageUri = relationData.pageUri;
    const pageViewType = relationData.pageViewType;
    const markerType = relationData.markerType;
    const uri = relationData.uri;
    const httpMethod = relationData.httpMethod;
    const rectId = relationData.rectId || '';
    // const urlTree = this.router.createUrlTree(['/ui-marker/page-detail'], {
    //   queryParams: {
    //     applicationId: applicationId,
    //     moduleId: moduleId,
    //     functionId: functionId,
    //     pageUrl: pageUri,
    //     pageViewType: pageViewType,
    //     markerType: markerType,
    //     uri: uri,
    //     httpMethod: httpMethod,
    //     rectId: rectId
    //   }
    // });
    // const url = this.router.serializeUrl(urlTree);
    // window.open(url, '_blank');
    const queryParams = {
      applicationId: applicationId,
      moduleId: moduleId,
      functionId: functionId,
      pageUrl: pageUri,
      pageViewType: pageViewType,
      markerType: markerType,
      uri: uri,
      httpMethod: httpMethod,
      rectId: rectId
    }
    this.urlToolService.navigateTo('/ui-marker/page-detail', queryParams);
  }
}
