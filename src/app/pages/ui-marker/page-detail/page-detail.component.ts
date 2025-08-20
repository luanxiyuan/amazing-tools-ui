import { Component, HostListener, Renderer2 } from '@angular/core';
import { SharedStoreService } from '../../../services/common/shared-store.service';
import { BaseComponent } from '../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { IMAGE_FAILBACK, API_BASE_URL, ELEMENT_CTA_TYPES, PAGE_CTA_TYPES, ELEMENT_FORM_PREFIX, PAGE_FORM_PREFIX, 
  UI_MARKER_SETTINGS, HTTP_METHODS, UI_MARKER_URIS, IMAGE_UPLOAD_NOTES, PAGE_VIEW_TYPES, APPLICATION_MARKETS, 
  APPLICATION_REGIONS, API_CLASSIFICATIONS, API_STATUSES, API_BELONGS_TO_APPLICATIONS, APPLICATIONS_BY_MARKET, 
  MARKER_TYPES} from '../../../consts/sys-consts';
import { CanvasToolService } from '../../../services/common/canvas-tool.service';
import { StringToolService } from '../../../services/common/string-tool.service';
import { UiMarkerService } from '../../../services/ui-marker/ui-marker.service';
import { NzImageService } from 'ng-zorro-antd/image';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormControl, FormRecord, Validators } from '@angular/forms';
import { ElementFormAPIControlEntity, PageFormAPIControlEntity, ApiFormDetails, MarkerFormDetails, PageFormDetails, CanvasMarkerPopup } from '../../../types/ui-marker-type';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { cloneDeep, isEqual, set } from 'lodash';
import { UrlToolService } from '../../../services/common/url-tool.service';
import { ApiTreeService } from '../../../services/api-tree/api-tree.service';
import { OpenAndPrivateApi, OpenAndPrivateApiEntity } from '../../../types/api-tree-type';
import { ApiDetailModel, SplunkConfig, SplunkSearchData } from '../../../types/splunk-search-type';
import { SplunkSearchService } from '../../../services/common/splunk-search.service';

declare module 'fabric' {
  namespace fabric {
    interface Object {
      id?: string;
    }
  }
}

@Component({
  selector: 'app-page-detail',
  templateUrl: './page-detail.component.html',
  styleUrls: ['./page-detail.component.css']
})
export class PageDetailComponent extends BaseComponent {

  constructor(
    private route: ActivatedRoute,
    private uiMarkerService: UiMarkerService,
    private stringToolService: StringToolService,
    public sharedStoreService: SharedStoreService,
    private nzImageService: NzImageService,
    private canvasToolService: CanvasToolService,
    private msg: NzMessageService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private urlToolService: UrlToolService,
    private apiTreeService: ApiTreeService,
    private renderer: Renderer2,
    private splunkService: SplunkSearchService,
  ) {
    super();
  }

  public selectedApplicationId: string = '';
  public selectedModuleId: string = '';
  public selectedFunctionId: string = '';

  public selectedPageUrl: string = '';
  public pageName: string = '';
  public fallback: string = IMAGE_FAILBACK;

  public selectedRectId: string = '';
  public doubleClickRectId: string = '';

  public elementEditDrawerVisible: boolean = false;
  public elementViewDrawerVisible: boolean = false;
  public pageEditDrawerVisible: boolean = false;
  public pageViewDrawerVisible: boolean = false;
  public editDrawerWidth: number = UI_MARKER_SETTINGS.EDIT_DRAWER_WIDTH;
  public viewDrawerWidth: number = UI_MARKER_SETTINGS.VIEW_DRAWER_WIDTH;

  public elementFormData: string = '';
  public elementFormDataForView: MarkerFormDetails = {};
  public pageFormData: string = '';
  public pageFormDataForView: PageFormDetails = {};

  public imageUploadURI: string = UI_MARKER_URIS.REPLACE_IMAGE;
  public imageUploadNotes: string[] = IMAGE_UPLOAD_NOTES;

  public elementCtaTypes: Array<string> = ELEMENT_CTA_TYPES;
  public pageCtaTypes: Array<string> = PAGE_CTA_TYPES;
  public pageViewTypes: Array<string> = PAGE_VIEW_TYPES;
  public originalPageViewType: string = '';
  public selectedPageViewType: string = '';
  private pageViewTypeChangedFlag: boolean = false;
  
  public httpMethods: Array<string> = HTTP_METHODS;

  public originalMarkerRectDetails: string = '';  // update this value everytime when after update API being triggered
  public latestMarkerRectDetails: string = '';  // update this value everytime when share service value canvasMarkerDetails get changed

  showMarkerPopupFlag: boolean = false;
  markerPopupLeft: number = 0;
  markerPopupTop: number = 0;
  markerEditable: boolean = false;

  public applicationScopeType: string = '';
  public applicationMarkets = APPLICATION_MARKETS;
  public applicationRegions = APPLICATION_REGIONS;
  public scopeTypeRegion = UI_MARKER_SETTINGS.APPLICATION_SCOPE_TYPE_REGION;
  public scopeTypeMarket = UI_MARKER_SETTINGS.APPLICATION_SCOPE_TYPE_MARKET;

  private currentFormType: 'Page' | 'Element' | '' = '';
  public highlightApiUri: string = '';
  public highlightApiHttpMethod: string = '';

  private searchSubject = new Subject<string>();
  private searchSubscription: any;
  public openAndPrivateApis: OpenAndPrivateApi[] = [];
  public groupedSearchApiMatchOptions: Map<string, OpenAndPrivateApi[]> = new Map<string, OpenAndPrivateApi[]>();

  // splunk search variables start
  public showSearchDialog: boolean = false;
  public channelList: any = [];
  public currentChannelConfig: any;
  public splunkConfig: SplunkConfig = {} as SplunkConfig;
  public environmentList: any = [];
  public applicationList: any = [];
  public searchTypeList: any = [];
  public marketList: any = [];
  public httpStatusList: any = [];
  public periodList: any = [];
  public currentApiDetail: ApiDetailModel = {};
  public systemConfig: any = {};
  public pageLocation: number = 0;
  public filterData: any = {
    selectedChannelId:'',
    selectedApplicationId: '',
    selectedEnvironmentId: '',
    selectedMarketId: '',
    selectedHttpStatus: '',
    period: '',
    usernameSearch: '',
    cifSearch: '',
    uri: '',
    diySearchLanguage: ''
  };
  public showField: any = {
    market: false,
    username:false,
    cif:false
  };
  // splunk search variables end

  validateElementForm: FormRecord<FormControl<string | null>> = new FormRecord({
    'other-supp-txtarea': new FormControl(''),
  });
  elementFormListOfControl: Array<ElementFormAPIControlEntity> = [];

  validatePageForm: FormRecord<FormControl<string | null>> = new FormRecord({
    'page-desc': new FormControl(''),
    'page-view-type': new FormControl(''),
    'scope-value': new FormControl(''),
    'page-other-supp-txtarea': new FormControl(''),
  });
  pageFormListOfControl: Array<ElementFormAPIControlEntity> = [];

  pannelStyle = {
    background: '#fdfdfd',
    'border-radius': '4px',
    'margin-top': '10px',
    border: '0px'
  }

  pageListUri = UI_MARKER_SETTINGS.PAGE_LIST_URI;
  
  ngOnInit() {
    // get the request param pageUrl from url
    this.route.queryParams.subscribe(params => {
      this.selectedPageUrl = API_BASE_URL + params['pageUrl'] || '';
      this.pageName = this.selectedPageUrl.split('/').pop()?.split('.')[0] || '';
    })

    this.sharedStoreService.getElementEditDrawerVisible().subscribe(visible => {
      this.elementEditDrawerVisible = visible;
    })

    this.sharedStoreService.getElementViewDrawerVisible().subscribe(visible => {
      this.elementViewDrawerVisible = visible;
    })

    this.sharedStoreService.getPageEditDrawerVisible().subscribe(visible => {
      this.pageEditDrawerVisible = visible;
    })

    this.sharedStoreService.getPageViewDrawerVisible().subscribe(visible => {
      this.pageViewDrawerVisible = visible;
    })

    this.sharedStoreService.getSelectedRectId().subscribe(id => {
      this.selectedRectId = id;
    })

    this.sharedStoreService.getSelectedApplicationId()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((id) => {
        this.selectedApplicationId = id;
        if (this.selectedApplicationId) {
          // prepare for the splunk log search function, it depends on this.selectedApplicationId, so we put it here
          this.getSplunkConfig();
        }
      });

    this.sharedStoreService.getSelectedModuleId()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((id) => {
        this.selectedModuleId = id;
      });

    this.sharedStoreService.getSelectedFunctionId()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((id) => {
        this.selectedFunctionId = id;
      });

    this.sharedStoreService.getCanvasMarkerDetails()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((details: string) => {
        details = ((details && typeof(details) === 'string')) ? JSON.parse(details) : details;
        this.latestMarkerRectDetails = details;
        this.checkAndUpdateCanvasMarkerDetails();
      });

    this.sharedStoreService.getElementFormDetails()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((formDetails: string) => {
        // when the pate loading, formDetails is empty, do nothing
        if (!formDetails) return;

        // in case there's nothing returned from API, go to edit mode directly
        if (formDetails === 'NO_CONTENT') {
          this.elementFormData = '';
          this.sharedStoreService.setElementFormViewable(false);
          // clean form details
          this.clearElementFormApiRecords();
          // add the form 1st API record
          // this.addElementFormApiRecords();
          this.initElementOtherValidation();
          // go to edit drawer
          this.sharedStoreService.setElementEditDrawerVisible(true);
        } else {    // in case there's marker form details, go to view mode
          this.sharedStoreService.setElementFormViewable(true);
          this.elementFormData = formDetails;
          const formData = ((formDetails && typeof(formDetails) === 'string')) ? JSON.parse(formDetails) : formDetails;
          // prepare the form data for view mode
          this.convertElementFormData(formData);
          // clean form details
          this.clearElementFormApiRecords();
          // initiate the form records
          this.initiateElementFormApiRecords();
          this.initElementOtherValidation();
          // prepare the edit mode details
          this.validateElementForm.patchValue(formData);
          // go to view mode drawer
          this.sharedStoreService.setElementViewDrawerVisible(true);
        }
      });

    this.sharedStoreService.getPageFormDetails()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((formDetails: string) => {
        // when the pate loading, formDetails is empty, do nothing
        if (!formDetails) return;

        // in case there's nothing returned from API, go to edit mode directly
        if (formDetails === 'NO_CONTENT') {
          this.pageFormData = '';
          this.sharedStoreService.setPageFormViewable(false);
          // clean form details
          this.clearPageFormApiRecords();
          // add the form 1st API record
          // this.addPageFormApiRecords();
          this.initPageOtherValidation();
          // go to edit drawer
          this.sharedStoreService.setPageEditDrawerVisible(true);
        } else {    // in case there's marker form details, go to view mode
          this.sharedStoreService.setPageFormViewable(true);
          this.pageFormData = formDetails;
          const formData = ((formDetails && typeof(formDetails) === 'string')) ? JSON.parse(formDetails) : formDetails;
          this.originalPageViewType = formData['page-view-type'] || '';
          // prepare the form data for view mode
          this.convertPageFormData(formData);
          // clean form details
          this.clearPageFormApiRecords();
          // initiate the form records
          this.initiatePageFormApiRecords();
          this.initPageOtherValidation();
          // prepare the edit mode details
          this.validatePageForm.patchValue(formData);
          // go to view mode drawer
          this.sharedStoreService.setPageViewDrawerVisible(true);
        }
      });

    this.sharedStoreService.getDoubleClickRectId()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((id: string) => {
        // when the page loading, id is empty, do nothing
        if (!id) return;

        this.doubleClickRectId = id;
        this.uiMarkerService.getElementFormDetails(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, this.pageName, id);
      });

    this.sharedStoreService.getDetailPageViewTypeChangeFlag()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((flag: boolean) => {
        if (flag) {
          this.pageViewTypeChangedFlag = true;
          // update the originalPageViewType for further comparation
          this.originalPageViewType = this.validatePageForm.get('page-view-type')?.value || '';
          // get the pageViewType from this.validatePageForm, which is used for updating the URL
          this.selectedPageViewType = this.validatePageForm.get('page-view-type')?.value || '';
          this.urlToolService.updateUrlQueryParam('pageViewType', this.selectedPageViewType);
        } else {
          this.pageViewTypeChangedFlag = false;
        }
      });

    this.sharedStoreService.getCanvasMarkerPopup()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((popup: CanvasMarkerPopup) => {
        this.setMarkerPopup(popup);
      });
    
    this.sharedStoreService.getApplicationScopeType()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((type) => {
        this.applicationScopeType = type;
      });

    // get open api list
    this.getOpenAndPrivateApis();

    this.sharedStoreService.getOpenAndPrivateApiUpdateResultFlag().subscribe((flag: boolean) => {
      if (flag) {
        // get latest open api list
        this.getOpenAndPrivateApis();
      }
    });

    this.searchSubscription = this.searchSubject.pipe(
        debounceTime(400)
      ).subscribe(uri => {
        if (uri) {
          this.onSearchApiMatchOptions(uri);
        }
      });

    // initially we need to hide this popup
    this.sharedStoreService.setCanvasMarkerPopup({ visible: false, left: 0, top: 0 });
  }

  getSplunkConfig() {
    this.splunkService.getConfig().subscribe((splunkRes: any) => {
      this.splunkConfig = splunkRes as SplunkConfig;
      this.channelList = Object.keys(this.splunkConfig.splunk);
      // if this.selectedApplicationId is in the channel list, it supports splunk search
      if (this.channelList.includes(this.selectedApplicationId)) {
        this.initSplunkFilter();
      }
    })
  }

  // the application id for splunk search is different from the application id in the url
  // the application id in url is like CBOL, MBOL, GFT..., we call it channel when searching in splunk
  // the application id for splunk search is like CAPI, GM...
  initSplunkFilter() {
    this.filterData.selectedChannelId = this.selectedApplicationId;
    this.currentChannelConfig = this.splunkConfig.splunk[this.filterData.selectedChannelId as keyof typeof this.splunkConfig.splunk];
    const envRoot = this.currentChannelConfig.envRoot;
    const market = this.currentChannelConfig.market;
    const httpStatus = this.currentChannelConfig.httpStatus;
    const period = this.currentChannelConfig.period;
    this.environmentList = [];
    this.applicationList = [];
    this.marketList = [];
    this.httpStatusList = [];
    this.periodList = [];
    for (let envKey in envRoot) {
      this.environmentList.push({ value: envKey, label: envRoot[envKey].label })
    }
    for (let marKey in market) {
      this.marketList.push({ value: marKey, label: market[marKey] })
    }
    for (let httpStatusKey in httpStatus) {
      this.httpStatusList.push({ value: httpStatusKey, label: httpStatus[httpStatusKey] })
    }
    for(let periodKey in period) {
      this.periodList.push({value: periodKey, label: period[periodKey]})
    }
    this.filterData.selectedEnvironmentId = this.environmentList[0]?.value;
    this.getValidApplicationsByEnvRoot();
    this.filterData.selectedApplicationId = this.applicationList[0]?.value;
    this.filterData.selectedMarketId = this.marketList[0]?.value;
    this.filterData.selectedHttpStatus = this.httpStatusList[0]?.value;
    this.filterData.selectedPeriod = this.periodList[1]?.value;
  }
  
  public getValidApplicationsByEnvRoot() {
    const application = this.currentChannelConfig.application;
    this.applicationList = [];
    for (let aplKey in application) {
      this.applicationList.push({ value: aplKey, label: application[aplKey] });

    }
    const envRoot = this.currentChannelConfig.envRoot[this.filterData.selectedEnvironmentId];
    this.applicationList = this.applicationList.filter((applicationItem: any) => {
      if (applicationItem && (Object.keys(envRoot.uri) as Array<string>).includes(applicationItem.value)) {
        return true;
      }
      return false;
    });
    if (this.applicationList && this.applicationList.length > 0) {
      this.filterData.selectedApplicationId = this.applicationList[0]?.value;
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.searchSubscription.unsubscribe();
  }

  getOpenAndPrivateApis() {
    this.apiTreeService.getOpenAndPrivateApis().subscribe((data: any) => {
      this.openAndPrivateApis = data;
    });
  }

  onSearchApiMatchOptions(uri: string) {
    // filter the dropdown apis by uri
    // in case the uri has the variable in the path, such as /v1/investments/mutualFunds/{0}/settlementAccounts, please match {0} to anything such as {accountid} or something
    let tempSearchApiResultOptions = cloneDeep(this.openAndPrivateApis);
    if (uri) {
      tempSearchApiResultOptions = tempSearchApiResultOptions.filter(api => 
        this.urlToolService.partialMatchUriWithVariables(uri, api.uri)
      );
    }
    // group the dropdown apis by channel
    this.groupedSearchApiMatchOptions = this.groupOpenAndPrivateApiByChannel(tempSearchApiResultOptions);
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

  onSearchSubApiInputChange(uri: string) {
    this.searchSubject.next(uri);
  }

  setMarkerPopup(popup: CanvasMarkerPopup) {
    if (popup.visible) {
      this.markerPopupLeft = popup.left;
      this.markerPopupTop = popup.top;
      this.showMarkerPopupFlag = true;
    } else {
      this.showMarkerPopupFlag = false;
    }
  }

  checkAndUpdateCanvasMarkerDetails() {
    // in case 1st time page rendering, latestMarkerRectDetails is null
    if (!this.originalMarkerRectDetails && !this.latestMarkerRectDetails) {
      console.log('1st time page rendering, no need to update canvas');
      return;
    }
    
    // in case this is the 1st rectangle being drawn
    if (!this.originalMarkerRectDetails) {
      console.log('the 1st rectangle being drawn');
      const latestRectDetails = (typeof(this.latestMarkerRectDetails) === 'string') ? JSON.parse(this.latestMarkerRectDetails) : this.latestMarkerRectDetails;
      this.uiMarkerService.saveMarkerDetails(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, this.pageName, JSON.stringify(latestRectDetails));
    }

    // in case user removed all the rectangles
    else if (!this.latestMarkerRectDetails) {
      console.log('user removed all the rectangles');
      this.uiMarkerService.removePageMarker(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, this.pageName);
    }

    // in case there're existing rectangle in the canvas and user edit them
    else {
      const latestRectDetails = (typeof(this.latestMarkerRectDetails) === 'string') ? JSON.parse(this.latestMarkerRectDetails) : this.latestMarkerRectDetails;
      const originalRectDetails = (typeof(this.originalMarkerRectDetails) === 'string') ? JSON.parse(this.originalMarkerRectDetails) : this.originalMarkerRectDetails;
      // if originalRectDetails is not equal to latestRectDetails, save the marker details
      if (!isEqual(latestRectDetails, originalRectDetails)) {
        console.log("call save marker details api to update rect details");
        this.uiMarkerService.saveMarkerDetails(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, this.pageName, JSON.stringify(latestRectDetails));
      } else {
        console.log('canvas marker has no change');
      }
    }

    // update original marker details
    this.originalMarkerRectDetails = JSON.stringify(this.latestMarkerRectDetails);
  }

  backToListingPage() {
    // check if this.sharedStoreService.getPageListLoadedFlag() is true, then go to previous uri
    // otherwise get the applicationId, moduleId and functionId and navigate to the listing page using router
    this.sharedStoreService.getPageListLoadedFlag()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((flag: boolean) => {
        if (flag) {
          return;
        } else {
          const queryParams = { 
            applicationId: this.selectedApplicationId,
            moduleId: this.selectedModuleId,
            functionId: this.selectedFunctionId
          }
          this.urlToolService.navigateTo(`${this.pageListUri}`, queryParams);
        }
      });
  }

  convertElementFormData(formData: any): void {
    let index = 0;
    const apiFormDetailArray: ApiFormDetails[] = [];
    while (formData[`${ELEMENT_FORM_PREFIX.CTA_CONTROL_INSTANCE}${index}`] !== undefined) {
      const apiFormDetail: ApiFormDetails = {
        ctaValue: formData[`${ELEMENT_FORM_PREFIX.CTA_CONTROL_INSTANCE}${index}`],
        conditionValue: formData[`${ELEMENT_FORM_PREFIX.CONDITION_CONTROL_INSTANCE}${index}`],
        methodValue: formData[`${ELEMENT_FORM_PREFIX.METHOD_CONTROL_INSTANCE}${index}`],
        uriValue: formData[`${ELEMENT_FORM_PREFIX.URI_CONTROL_INSTANCE}${index}`],
        sampleReqValue: formData[`${ELEMENT_FORM_PREFIX.SAMPLE_REQ_CONTROL_INSTANCE}${index}`],
        sampleResValue: formData[`${ELEMENT_FORM_PREFIX.SAMPLE_RES_CONTROL_INSTANCE}${index}`],
        commentsValue: formData[`${ELEMENT_FORM_PREFIX.COMMENTS_CONTROL_INSTANCE}${index}`]
      };
      apiFormDetailArray.push(apiFormDetail);
      index++;
    }
    this.elementFormDataForView = {
      apiFormDetails: apiFormDetailArray,
      apiNumber: formData.apiNumber,
      otherSuppTextArea: formData['other-supp-txtarea']
    }
  }

  convertPageFormData(formData: any): void {
    let index = 0;
    const apiFormDetailArray: ApiFormDetails[] = [];
    while (formData[`${PAGE_FORM_PREFIX.CTA_CONTROL_INSTANCE}${index}`] !== undefined) {
      const apiFormDetail: ApiFormDetails = {
        ctaValue: formData[`${PAGE_FORM_PREFIX.CTA_CONTROL_INSTANCE}${index}`],
        conditionValue: formData[`${PAGE_FORM_PREFIX.CONDITION_CONTROL_INSTANCE}${index}`],
        methodValue: formData[`${PAGE_FORM_PREFIX.METHOD_CONTROL_INSTANCE}${index}`],
        uriValue: formData[`${PAGE_FORM_PREFIX.URI_CONTROL_INSTANCE}${index}`],
        sampleReqValue: formData[`${PAGE_FORM_PREFIX.SAMPLE_REQ_CONTROL_INSTANCE}${index}`],
        sampleResValue: formData[`${PAGE_FORM_PREFIX.SAMPLE_RES_CONTROL_INSTANCE}${index}`],
        commentsValue: formData[`${PAGE_FORM_PREFIX.COMMENTS_CONTROL_INSTANCE}${index}`]
      };
      apiFormDetailArray.push(apiFormDetail);
      index++;
    }
    this.pageFormDataForView = {
      pageDesc: formData['page-desc'],
      pageViewType: formData['page-view-type'],
      scopeValue: formData['scope-value'],
      apiFormDetails: apiFormDetailArray,
      apiNumber: formData.apiNumber,
      otherSuppTextArea: formData['page-other-supp-txtarea']
    }
  }

  ngAfterViewInit(): void {
    // get the query param pageViewType
    this.selectedPageViewType = this.urlToolService.getUrlQueryParam('pageViewType') || '';
    // check if has edit permission
    this.markerEditable = !!UI_MARKER_SETTINGS.CANVAS_EDIT_PERMISSION;
    // init canvas
    this.canvasToolService.initCanvas(this.selectedPageUrl, this.selectedPageViewType, this.markerEditable);
    this.canvasToolService.initDrawableEvents();
    this.canvasToolService.monitorDetailsPoopup();
    
    // load the maker json data to shared service
    setTimeout(() => {
      this.uiMarkerService.getMarkerDetails(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, this.pageName);
    }, 10);

    // handle the case when page is navigated from api list page to view a marker details
    setTimeout(() => {
      this.openPageOrElementDrawer();
    }, 10);
  }

  openPageOrElementDrawer() {
    const markerType = this.urlToolService.getUrlQueryParam('markerType');
    if (!markerType) return;

    this.highlightApiUri = this.urlToolService.getUrlQueryParam('uri');
    this.highlightApiHttpMethod = this.urlToolService.getUrlQueryParam('httpMethod');
    if (markerType === MARKER_TYPES[0]) {     // in case to view the page details
      // open the page view drawer
      this.pageInformation();
    } else if (markerType === MARKER_TYPES[1]) {    // in case to view the element details
      const rectId = this.urlToolService.getUrlQueryParam('rectId');
      // open the element view drawer
      this.sharedStoreService.setSelectedRectId(rectId);
      this.sharedStoreService.setDoubleClickRectId(rectId);
      this.canvasToolService.activeRectById(rectId);
    }
    setTimeout(() => {
      this.flashBackground(this.highlightApiUri + '_' + this.highlightApiHttpMethod);
    }, 500);
  }

  flashBackground(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      this.renderer.addClass(element, 'flash-background');
      setTimeout(() => {
        this.renderer.removeClass(element, 'flash-background');
      }, 3000); // Remove the class after 3 seconds
    }
  }

  copyToClipboard(value: string): void {
    this.stringToolService.copyToClipboard(value);
  }

  // @HostListener('window:keydown', ['$event'])
  // handleKeyDown(event: KeyboardEvent) {
  //   // can be removed only when the drawer is not opened and key is backspace
  //   if (this.canvasToolService.hasActiveObject() 
  //       && (!this.elementEditDrawerVisible && !this.elementViewDrawerVisible && !this.pageEditDrawerVisible && !this.pageViewDrawerVisible)
  //       && event.key === 'Backspace') {
  //     this.showConfirmToRemoveRect(event);
  //   }
  // }

  // showConfirmToRemoveRect(event: KeyboardEvent): void {
  //   this.modal.confirm({
  //     nzTitle: '<i>Do you want to remove this marker?</i>',
  //     nzContent: '<b>Please note that this marker related comments will be removed as well.</b>',
  //     nzOnOk: () => {
  //       // remove the rect from canvas
  //       this.canvasToolService.handleRemoveEvent(event);
  //       // remove rect comments json file
  //       this.uiMarkerService.removeMarkerDetails(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, this.pageName, this.selectedRectId);
  //     }
  //   });
  // }

  removeMarkerRectangle() {
    // remove the rect from canvas
    this.canvasToolService.removeActiveRect();
    // remove rect comments json file
    this.uiMarkerService.removeMarkerDetails(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, this.pageName, this.selectedRectId);
    // hide the popup
    this.sharedStoreService.setCanvasMarkerPopup({ visible: false, left: 0, top: 0 });
  }

  showMarkerDetails() {
    this.canvasToolService.setDoubleClickRectIdToViewMarkerDetails();
  }

  // this fuction is only called when user click "save marked details" button
  saveMarkerDetails() {
    if (this.latestMarkerRectDetails) {
      const latestRectDetails = (typeof(this.latestMarkerRectDetails) === 'string') ? JSON.parse(this.latestMarkerRectDetails) : this.latestMarkerRectDetails;
      this.uiMarkerService.saveMarkerDetails(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, this.pageName, JSON.stringify(latestRectDetails));
    }
  }

  closeEditDrawer() {
    this.sharedStoreService.setElementEditDrawerVisible(false);
  }

  closeViewDrawer() {
    this.sharedStoreService.setElementViewDrawerVisible(false);
  }

  goToElementViewMode() {
    // reload the marker form details for view mode
    this.uiMarkerService.getElementFormDetails(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, this.pageName, this.doubleClickRectId);
    this.sharedStoreService.setElementViewDrawerVisible(true);
    this.sharedStoreService.setElementEditDrawerVisible(false);
  }

  goToElementEditMode() {
    this.sharedStoreService.setElementEditDrawerVisible(true);
    this.sharedStoreService.setElementViewDrawerVisible(false);
  }

  previewUI() {
    const images = [
      {
        src: this.selectedPageUrl
      }
    ]
    this.nzImageService.preview(images, { nzZoom: 1, nzRotate: 0 });
  }

  initElementOtherValidation() {
    this.validateElementForm.addControl(
      'other-supp-txtarea',
      this.fb.control('', null)
    )
  }

  initPageOtherValidation() {
    this.validatePageForm.addControl(
      'page-desc',
      this.fb.control('', null)
    );
    this.validatePageForm.addControl(
      'page-view-type',
      this.fb.control('', null)
    );
    this.validatePageForm.addControl(
      'scope-value',
      this.fb.control('', null)
    );
    this.validatePageForm.addControl(
      'page-other-supp-txtarea',
      this.fb.control('', null)
    );
  }

  addElementFormApiRecords(e?: MouseEvent): void {
    e?.preventDefault();

    this.addElementSingleApiControlRecord()
  }

  addPageFormApiRecords(e?: MouseEvent): void {
    e?.preventDefault();

    this.addPageSingleApiControlRecord()
  }

  clearElementFormApiRecords() {
    if (this.validateElementForm.controls) {
      Object.keys(this.validateElementForm.controls).forEach((controlName) => {
        this.validateElementForm.removeControl(controlName);
      });
    }
    // set this.elementFormListOfControl empty
    this.elementFormListOfControl = [];
  }

  clearPageFormApiRecords() {
    if (this.validatePageForm.controls) {
      Object.keys(this.validatePageForm.controls).forEach((controlName) => {
        this.validatePageForm.removeControl(controlName);
      });
    }
    // set this.pageFormListOfControl empty
    this.pageFormListOfControl = [];
  }

  addElementSingleApiControlRecord() {
    const id = this.elementFormListOfControl.length > 0 ? this.elementFormListOfControl[this.elementFormListOfControl.length - 1].id + 1 : 0;

    const control: ElementFormAPIControlEntity = {
      id,
      ctaId: `${ELEMENT_FORM_PREFIX.CTA_ID}${id}`,
      ctaControlInstance: `${ELEMENT_FORM_PREFIX.CTA_CONTROL_INSTANCE}${id}`,
      uriId: `${ELEMENT_FORM_PREFIX.URI_ID}${id}`,
      uriControlInstance: `${ELEMENT_FORM_PREFIX.URI_CONTROL_INSTANCE}${id}`,
      methodId: `${ELEMENT_FORM_PREFIX.METHOD_ID}${id}`,
      methodControlInstance: `${ELEMENT_FORM_PREFIX.METHOD_CONTROL_INSTANCE}${id}`,
      conditionId: `${ELEMENT_FORM_PREFIX.CONDITION_ID}${id}`,
      conditionControlInstance: `${ELEMENT_FORM_PREFIX.CONDITION_CONTROL_INSTANCE}${id}`,
      sampleReqId: `${ELEMENT_FORM_PREFIX.SAMPLE_REQ_ID}${id}`,
      sampleReqControlInstance: `${ELEMENT_FORM_PREFIX.SAMPLE_REQ_CONTROL_INSTANCE}${id}`,
      sampleResId: `${ELEMENT_FORM_PREFIX.SAMPLE_RES_ID}${id}`,
      sampleResControlInstance: `${ELEMENT_FORM_PREFIX.SAMPLE_RES_CONTROL_INSTANCE}${id}`,
      commentsId: `${ELEMENT_FORM_PREFIX.COMMENTS_ID}${id}`,
      commentsControlInstance: `${ELEMENT_FORM_PREFIX.COMMENTS_CONTROL_INSTANCE}${id}`
    };
    const index = this.elementFormListOfControl.push(control);
    console.log(this.elementFormListOfControl[this.elementFormListOfControl.length - 1]);
    this.validateElementForm.addControl(
      this.elementFormListOfControl[index - 1].ctaControlInstance,
      this.fb.control('', Validators.required)
    );
    this.validateElementForm.addControl(
      this.elementFormListOfControl[index - 1].uriControlInstance,
      this.fb.control('', Validators.required)
    );
    this.validateElementForm.addControl(
      this.elementFormListOfControl[index - 1].methodControlInstance,
      this.fb.control('', Validators.required)
    );
    this.validateElementForm.addControl(
      this.elementFormListOfControl[index - 1].conditionControlInstance,
      this.fb.control('', null)
    );
    this.validateElementForm.addControl(
      this.elementFormListOfControl[index - 1].sampleReqControlInstance,
      this.fb.control('', null)
    );
    this.validateElementForm.addControl(
      this.elementFormListOfControl[index - 1].sampleResControlInstance,
      this.fb.control('', null)
    );
    this.validateElementForm.addControl(
      this.elementFormListOfControl[index - 1].commentsControlInstance,
      this.fb.control('', null)
    );
  }

  addPageSingleApiControlRecord() {
    const id = this.pageFormListOfControl.length > 0 ? this.pageFormListOfControl[this.pageFormListOfControl.length - 1].id + 1 : 0;

    const control: PageFormAPIControlEntity = {
      id,
      ctaId: `${PAGE_FORM_PREFIX.CTA_ID}${id}`,
      ctaControlInstance: `${PAGE_FORM_PREFIX.CTA_CONTROL_INSTANCE}${id}`,
      uriId: `${PAGE_FORM_PREFIX.URI_ID}${id}`,
      uriControlInstance: `${PAGE_FORM_PREFIX.URI_CONTROL_INSTANCE}${id}`,
      methodId: `${PAGE_FORM_PREFIX.METHOD_ID}${id}`,
      methodControlInstance: `${PAGE_FORM_PREFIX.METHOD_CONTROL_INSTANCE}${id}`,
      conditionId: `${PAGE_FORM_PREFIX.CONDITION_ID}${id}`,
      conditionControlInstance: `${PAGE_FORM_PREFIX.CONDITION_CONTROL_INSTANCE}${id}`,
      sampleReqId: `${PAGE_FORM_PREFIX.SAMPLE_REQ_ID}${id}`,
      sampleReqControlInstance: `${PAGE_FORM_PREFIX.SAMPLE_REQ_CONTROL_INSTANCE}${id}`,
      sampleResId: `${PAGE_FORM_PREFIX.SAMPLE_RES_ID}${id}`,
      sampleResControlInstance: `${PAGE_FORM_PREFIX.SAMPLE_RES_CONTROL_INSTANCE}${id}`,
      commentsId: `${PAGE_FORM_PREFIX.COMMENTS_ID}${id}`,
      commentsControlInstance: `${PAGE_FORM_PREFIX.COMMENTS_CONTROL_INSTANCE}${id}`
    };
    const index = this.pageFormListOfControl.push(control);
    console.log(this.pageFormListOfControl[this.pageFormListOfControl.length - 1]);
    this.validatePageForm.addControl(
      this.pageFormListOfControl[index - 1].ctaControlInstance,
      this.fb.control('', Validators.required)
    );
    this.validatePageForm.addControl(
      this.pageFormListOfControl[index - 1].uriControlInstance,
      this.fb.control('', Validators.required)
    );
    this.validatePageForm.addControl(
      this.pageFormListOfControl[index - 1].methodControlInstance,
      this.fb.control('', Validators.required)
    );
    this.validatePageForm.addControl(
      this.pageFormListOfControl[index - 1].conditionControlInstance,
      this.fb.control('', null)
    );
    this.validatePageForm.addControl(
      this.pageFormListOfControl[index - 1].sampleReqControlInstance,
      this.fb.control('', null)
    );
    this.validatePageForm.addControl(
      this.pageFormListOfControl[index - 1].sampleResControlInstance,
      this.fb.control('', null)
    );
    this.validatePageForm.addControl(
      this.pageFormListOfControl[index - 1].commentsControlInstance,
      this.fb.control('', null)
    );
  }

  initiateElementFormApiRecords() {
    // convert this.elementFormData to json
    if (this.elementFormData) {
      const formData = ((this.elementFormData && typeof(this.elementFormData) === 'string')) ? JSON.parse(this.elementFormData) : this.elementFormData;
      if (formData.apiNumber > 0) {
        // loop through the apiNumber
        for (let i = 0; i < formData.apiNumber; i++) {
          this.addElementSingleApiControlRecord();
        }
      }
    }
  }

  initiatePageFormApiRecords() {
    // convert this.elementFormData to json
    if (this.pageFormData) {
      const formData = ((this.pageFormData && typeof(this.pageFormData) === 'string')) ? JSON.parse(this.pageFormData) : this.pageFormData;
      if (formData.apiNumber > 0) {
        // loop through the apiNumber
        for (let i = 0; i < formData.apiNumber; i++) {
          this.addPageSingleApiControlRecord();
        }
      }
    }
  }

  removeElementApiRecord(e: ElementFormAPIControlEntity) {
    if (this.elementFormListOfControl.length >= 1) {
      const index = this.elementFormListOfControl.indexOf(e);
      // if the index is not the last one, need to move the control instance from index + 1 to index
      // update the corresponding value in validateElementForm
      if (index !== this.elementFormListOfControl.length - 1) {
        for (let i = index; i < this.elementFormListOfControl.length - 1; i++) {
          // update the value in validateElementForm
          this.validateElementForm.get(`${ELEMENT_FORM_PREFIX.CTA_CONTROL_INSTANCE}${i}`)?.setValue(this.validateElementForm.get(`${ELEMENT_FORM_PREFIX.CTA_CONTROL_INSTANCE}${i + 1}`)?.value || '');
          this.validateElementForm.get(`${ELEMENT_FORM_PREFIX.URI_CONTROL_INSTANCE}${i}`)?.setValue(this.validateElementForm.get(`${ELEMENT_FORM_PREFIX.URI_CONTROL_INSTANCE}${i + 1}`)?.value || '');
          this.validateElementForm.get(`${ELEMENT_FORM_PREFIX.METHOD_CONTROL_INSTANCE}${i}`)?.setValue(this.validateElementForm.get(`${ELEMENT_FORM_PREFIX.METHOD_CONTROL_INSTANCE}${i + 1}`)?.value || '');
          this.validateElementForm.get(`${ELEMENT_FORM_PREFIX.CONDITION_CONTROL_INSTANCE}${i}`)?.setValue(this.validateElementForm.get(`${ELEMENT_FORM_PREFIX.CONDITION_CONTROL_INSTANCE}${i + 1}`)?.value || '');
          this.validateElementForm.get(`${ELEMENT_FORM_PREFIX.SAMPLE_REQ_CONTROL_INSTANCE}${i}`)?.setValue(this.validateElementForm.get(`${ELEMENT_FORM_PREFIX.SAMPLE_REQ_CONTROL_INSTANCE}${i + 1}`)?.value || '');
          this.validateElementForm.get(`${ELEMENT_FORM_PREFIX.SAMPLE_RES_CONTROL_INSTANCE}${i}`)?.setValue(this.validateElementForm.get(`${ELEMENT_FORM_PREFIX.SAMPLE_RES_CONTROL_INSTANCE}${i + 1}`)?.value || '');
          this.validateElementForm.get(`${ELEMENT_FORM_PREFIX.COMMENTS_CONTROL_INSTANCE}${i}`)?.setValue(this.validateElementForm.get(`${ELEMENT_FORM_PREFIX.COMMENTS_CONTROL_INSTANCE}${i + 1}`)?.value || '');
        }
      }
      const lastIndex = this.elementFormListOfControl.length - 1;
      // remove the corresponding api record control instance
      this.elementFormListOfControl.splice(lastIndex, 1);
      // remove the last record control instance
      this.validateElementForm.removeControl(`${ELEMENT_FORM_PREFIX.CTA_CONTROL_INSTANCE}${lastIndex}`);
      this.validateElementForm.removeControl(`${ELEMENT_FORM_PREFIX.URI_CONTROL_INSTANCE}${lastIndex}`);
      this.validateElementForm.removeControl(`${ELEMENT_FORM_PREFIX.METHOD_CONTROL_INSTANCE}${lastIndex}`);
      this.validateElementForm.removeControl(`${ELEMENT_FORM_PREFIX.CONDITION_CONTROL_INSTANCE}${lastIndex}`);
      this.validateElementForm.removeControl(`${ELEMENT_FORM_PREFIX.SAMPLE_REQ_CONTROL_INSTANCE}${lastIndex}`);
      this.validateElementForm.removeControl(`${ELEMENT_FORM_PREFIX.SAMPLE_RES_CONTROL_INSTANCE}${lastIndex}`);
      this.validateElementForm.removeControl(`${ELEMENT_FORM_PREFIX.COMMENTS_CONTROL_INSTANCE}${lastIndex}`);
    }
  }

  removePageApiRecord(e: ElementFormAPIControlEntity) {
    if (this.pageFormListOfControl.length >= 1) {
      const index = this.pageFormListOfControl.indexOf(e);
      // if the index is not the last one, need to move the control instance from index + 1 to index
      // update the corresponding value in validatePageForm
      if (index !== this.pageFormListOfControl.length - 1) {
        for (let i = index; i < this.pageFormListOfControl.length - 1; i++) {
          // update the value in validatePageForm
          this.validatePageForm.get(`${PAGE_FORM_PREFIX.CTA_CONTROL_INSTANCE}${i}`)?.setValue(this.validatePageForm.get(`${PAGE_FORM_PREFIX.CTA_CONTROL_INSTANCE}${i + 1}`)?.value || '');
          this.validatePageForm.get(`${PAGE_FORM_PREFIX.URI_CONTROL_INSTANCE}${i}`)?.setValue(this.validatePageForm.get(`${PAGE_FORM_PREFIX.URI_CONTROL_INSTANCE}${i + 1}`)?.value || '');
          this.validatePageForm.get(`${PAGE_FORM_PREFIX.METHOD_CONTROL_INSTANCE}${i}`)?.setValue(this.validatePageForm.get(`${PAGE_FORM_PREFIX.METHOD_CONTROL_INSTANCE}${i + 1}`)?.value || '');
          this.validatePageForm.get(`${PAGE_FORM_PREFIX.CONDITION_CONTROL_INSTANCE}${i}`)?.setValue(this.validatePageForm.get(`${PAGE_FORM_PREFIX.CONDITION_CONTROL_INSTANCE}${i + 1}`)?.value || '');
          this.validatePageForm.get(`${PAGE_FORM_PREFIX.SAMPLE_REQ_CONTROL_INSTANCE}${i}`)?.setValue(this.validatePageForm.get(`${PAGE_FORM_PREFIX.SAMPLE_REQ_CONTROL_INSTANCE}${i + 1}`)?.value || '');
          this.validatePageForm.get(`${PAGE_FORM_PREFIX.SAMPLE_RES_CONTROL_INSTANCE}${i}`)?.setValue(this.validatePageForm.get(`${PAGE_FORM_PREFIX.SAMPLE_RES_CONTROL_INSTANCE}${i + 1}`)?.value || '');
          this.validatePageForm.get(`${PAGE_FORM_PREFIX.COMMENTS_CONTROL_INSTANCE}${i}`)?.setValue(this.validatePageForm.get(`${PAGE_FORM_PREFIX.COMMENTS_CONTROL_INSTANCE}${i + 1}`)?.value || '');
        }
      }
      const lastIndex = this.pageFormListOfControl.length - 1;
      // remove the corresponding api record control instance
      this.pageFormListOfControl.splice(lastIndex, 1);
      // remove the last record control instance
      this.validatePageForm.removeControl(`${PAGE_FORM_PREFIX.CTA_CONTROL_INSTANCE}${lastIndex}`);
      this.validatePageForm.removeControl(`${PAGE_FORM_PREFIX.URI_CONTROL_INSTANCE}${lastIndex}`);
      this.validatePageForm.removeControl(`${PAGE_FORM_PREFIX.METHOD_CONTROL_INSTANCE}${lastIndex}`);
      this.validatePageForm.removeControl(`${PAGE_FORM_PREFIX.CONDITION_CONTROL_INSTANCE}${lastIndex}`);
      this.validatePageForm.removeControl(`${PAGE_FORM_PREFIX.SAMPLE_REQ_CONTROL_INSTANCE}${lastIndex}`);
      this.validatePageForm.removeControl(`${PAGE_FORM_PREFIX.SAMPLE_RES_CONTROL_INSTANCE}${lastIndex}`);
      this.validatePageForm.removeControl(`${PAGE_FORM_PREFIX.COMMENTS_CONTROL_INSTANCE}${lastIndex}`);
    }
  }

  submitElementForm(): void {
    // if all the values are empty in validateElementForm
    if (Object.values(this.validateElementForm.value).every((x) => (x === null || x === ''))) {
      this.msg.warning('Please fill in at least one field to submit the form.');
      return;
    }

    if (this.validateElementForm.valid) {
      let elementFormObj = {
        ...this.validateElementForm.value,
        apiNumber: this.elementFormListOfControl.length
      }
      // call backend API to store formObj data
      console.log('submit', elementFormObj);
      this.uiMarkerService.saveElementFormDetails(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, this.pageName, this.selectedRectId, JSON.stringify(elementFormObj));

      // sycn the API details to Odyssey X - API
      if (UI_MARKER_SETTINGS.SYNC_API_TREE_FLAG) {
        this.currentFormType = 'Element';
        this.syncApiDetails(this.elementFormListOfControl, this.currentFormType);
      }
    } else {
      Object.values(this.validateElementForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  submitPageForm(): void {
    if (this.validatePageForm.valid) {
      const pageViewTypeChangeFlag = this.isPageViewTypeChanged();
      let pageFormObj = {
        ...this.validatePageForm.value,
        apiNumber: this.pageFormListOfControl.length
      }
      // call backend API to store formObj data
      console.log('submit', pageFormObj);
      const refreshFlag = true;
      this.uiMarkerService.savePageFormDetails(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, this.pageName, JSON.stringify(pageFormObj), refreshFlag, pageViewTypeChangeFlag);

      // sycn the API details to Odyssey X - API
      if (UI_MARKER_SETTINGS.SYNC_API_TREE_FLAG) {
        this.currentFormType = 'Page';
        this.syncApiDetails(this.pageFormListOfControl, this.currentFormType);
      }
    } else {
      Object.values(this.validatePageForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  syncApiDetails(apiControlEntities: Array<ElementFormAPIControlEntity>, formType: 'Element' | 'Page') {
    // if this.apiControlEntities.length > 0, convert this.apiControlEntities each item to OpenAndPrivateApi 
    if (apiControlEntities.length > 0) {
      const apiDetails: OpenAndPrivateApi[] = [];
      // loop apiControlEntities and convert each item to OpenAndPrivateApi
      for (let apiControlEntity of apiControlEntities) {
        // if this.selectedApplicationId is in APPLICATIONS_BY_MARKET, then set a varialble belongsToApplication as API_BELONGS_TO_APPLICATIONS[0].name
        // else set a const value as API_BELONGS_TO_APPLICATIONS[1].name
        let belongsToApplication = '';
        if (APPLICATIONS_BY_MARKET.includes(this.selectedApplicationId)) {
          belongsToApplication = API_BELONGS_TO_APPLICATIONS[0].name;
        } else {
          belongsToApplication = API_BELONGS_TO_APPLICATIONS[1].name;
        }
        // get the htpMthod and uri
        let httpMethod = '';
        let uri = '';
        if (formType === 'Element') {
          httpMethod = this.validateElementForm.get(apiControlEntity.methodControlInstance)?.value || '';
          uri = this.validateElementForm.get(apiControlEntity.uriControlInstance)?.value || '';
        } else {
          httpMethod = this.validatePageForm.get(apiControlEntity.methodControlInstance)?.value || '';
          uri = this.validatePageForm.get(apiControlEntity.uriControlInstance)?.value || '';
        }

        let newOpenAndPrivateApi: OpenAndPrivateApi = new OpenAndPrivateApiEntity();
        newOpenAndPrivateApi.swaggerTitle = '';
        newOpenAndPrivateApi.serviceName = '';
        newOpenAndPrivateApi.bianBehaviorQualifier = '';
        newOpenAndPrivateApi.subQualifier = '';
        newOpenAndPrivateApi.channel = '';
        newOpenAndPrivateApi.regionOrCountry = '';
        newOpenAndPrivateApi.apiName = '';
        newOpenAndPrivateApi.httpMethod = httpMethod;
        newOpenAndPrivateApi.uri = uri;
        newOpenAndPrivateApi.classification = API_CLASSIFICATIONS[0]; // set the value to Open
        newOpenAndPrivateApi.bianAdoptionLevel = '';
        newOpenAndPrivateApi.apiStatus = API_STATUSES[0];
        newOpenAndPrivateApi.belongsToApplication = belongsToApplication;
        newOpenAndPrivateApi.subIds = [];
        newOpenAndPrivateApi.remark = '';
        apiDetails.push(newOpenAndPrivateApi);
      };
      this.apiTreeService.addOpenApis(apiDetails);
    }
  }

  isPageViewTypeChanged() {
    // get the old pageViewType from this.pageForm
    const oldPageViewType = this.originalPageViewType;
    // get the new pageViewType from this.validatePageForm
    const newPageViewType = this.validatePageForm.get('page-view-type')?.value || '';
    return oldPageViewType !== newPageViewType;
  }

  pageInformation() {
    this.sharedStoreService.setPageFormDetails("");
    this.uiMarkerService.getPageFormDetails(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, this.pageName);
  }

  goToPageEditMode() {
    this.sharedStoreService.setPageEditDrawerVisible(true);
    this.sharedStoreService.setPageViewDrawerVisible(false);
  }

  goToPageViewMode() {
    // reload the page form details for view mode
    this.uiMarkerService.getPageFormDetails(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, this.pageName);
    this.sharedStoreService.setPageViewDrawerVisible(true);
    this.sharedStoreService.setPageEditDrawerVisible(false);
  }

  closePageEditDrawer() {
    this.sharedStoreService.setPageEditDrawerVisible(false);
    this.reloadPage();
  }

  closePageViewDrawer() {
    this.sharedStoreService.setPageViewDrawerVisible(false);
    this.reloadPage();
  }

  reloadPage() {
    // reload the current page
    if (this.pageViewTypeChangedFlag) {
      window.location.reload();
    }
  }

  replaceUI() {
    this.sharedStoreService.setShowUploadImgDialog(true);
  }

  setFileUploadParams = () => {
    // if selectedApplicationId, selectedModuleId and selectedFunctionId are not empty
    if (this.selectedApplicationId && this.selectedModuleId && this.selectedFunctionId) {
      return {
        applicationId: this.selectedApplicationId, 
        moduleId: this.selectedModuleId,
        functionId: this.selectedFunctionId,
        pageName: this.pageName
      }
    }
    return null;
  }

  afterImageUpload() {
    this.canvasToolService.loadBackgroundImg(this.selectedPageUrl);
  }

  openApiLink(uri: string, method: string) {
    if (uri) {
      // if uri ends with /, remove it
      uri = uri.endsWith('/') ? uri.slice(0, -1) : uri;
      // open a new window with params uri and method as query param uri and httpMethod
      this.urlToolService.navigateTo(`/api-tree/api-list`, { uri, httpMethod: method });
    }
  }
  
  changeChannel() {
    this.currentChannelConfig = this.splunkConfig.splunk[this.filterData.selectedChannelId as keyof typeof this.splunkConfig.splunk];
    this.marketList = [];
    this.applicationList = [];
    const market = this.currentChannelConfig.market;
    for (let marKey in market) {
      this.marketList.push({ value: marKey, label: market[marKey] })
    } 
    this.getValidApplicationsByEnvRoot();
    this.filterData.selectedApplicationId = this.applicationList[0]?.value;
    this.filterData.selectedMarketId = this.marketList[0]?.value;
  }
  
  openSearchDialog(apiDetails: ApiFormDetails) {
    this.filterData.selectedChannelId = this.selectedApplicationId;
    this.changeChannel();
    this.showSearchDialog = true;
    set(this.currentApiDetail, 'uri', apiDetails.uriValue);
    this.filterData.uri = this.currentApiDetail.uri;
  }
  
  closeSearchDialog() {
    this.showSearchDialog = false;
  }

  searchLog() {
    const linkParam: SplunkSearchData = {
      uri: this.filterData.uri,
      envRoot: this.filterData.selectedEnvironmentId,
      application: this.filterData.selectedApplicationId,
      market: this.filterData.selectedMarketId,
      httpStatus: this.filterData.selectedHttpStatus,
      period: this.filterData.selectedPeriod,
      username: this.filterData.usernameSearch,
      cif: this.filterData.cifSearch,
      diySearchLanguage: this.filterData.diySearchLanguage
    }
    const splunkUrl = this.splunkService.getQuickSplunkSearchLink(linkParam, this.filterData.selectedChannelId);
    if (splunkUrl) {
      this.urlToolService.linkToOtherSite(splunkUrl);
    } else {
      alert('Some error, please try again')
    }
  }
}
