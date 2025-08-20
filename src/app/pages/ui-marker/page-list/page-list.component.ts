import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UI_MARKER_URIS, API_BASE_URL, IMAGE_FAILBACK, IMAGE_UPLOAD_NOTES, PAGE_VIEW_TYPES, UI_MARKER_SETTINGS, 
  APPLICATION_MARKETS, APPLICATION_REGIONS } from '../../../consts/sys-consts';
import { BaseComponent } from '../../base/base.component';
import { SharedStoreService } from '../../../services/common/shared-store.service';
import { takeUntil } from 'rxjs';
import { UiMarkerService } from '../../../services/ui-marker/ui-marker.service';
import { PageListingEntity } from '../../../types/ui-marker-type';
import { UploadImageSuppInfo } from '../../common/upload-image/upload-image-type';
import { cloneDeep } from 'lodash';
import { UrlToolService } from '../../../services/common/url-tool.service';

@Component({
  selector: 'app-page-list',
  templateUrl: './page-list.component.html',
  styleUrls: ['./page-list.component.css']
})
export class PageListComponent extends BaseComponent implements AfterViewInit {

  constructor(
    private msg: NzMessageService,
    private uiMarkerService: UiMarkerService,
    private sharedStoreService: SharedStoreService,
    private route: ActivatedRoute,
    private router: Router,
    private urlToolService: UrlToolService
  ) {
    super();
  }

  public selectedApplicationId: string = '';
  public selectedModuleId: string = '';
  public selectedFunctionId: string = '';
  public functionPages: PageListingEntity[] = [];
  public filteredFunctionPages: PageListingEntity[] = [];
  public pageViewTypes: Array<string> = PAGE_VIEW_TYPES;
  public selectedViewType: string = '';
  nzXsSize: number = 24;
  nzSmSize: number = 24;
  nzMdSize: number = 12;
  nzLgSize: number = 12;
  nzXlSize: number = 12;
  gridViewCardClass: string = 'image-card super-width-adapt';

  public showPageViewTypeWhenUpload: boolean = true;
  public showPageTitleWhenUpload: boolean = true;

  public imageUploadURI: string = UI_MARKER_URIS.UPLOAD_IMAGE;

  public fallback: string = IMAGE_FAILBACK;
  public pageListViewType: string = this.sharedStoreService.getPageListViewType() || "Grid";
  public listingTypeOptions = [
    { label: 'Grid', value: 'Grid', icon: 'appstore' },
    { label: 'List', value: 'List', icon: 'bars' }
  ];

  public imageBaseUrl: string = API_BASE_URL;
  public imageUploadNotes: string[] = IMAGE_UPLOAD_NOTES;
  public isOperationDisabled: boolean = true;

  public applicationScopeType: string = '';
  public applicationMarkets = APPLICATION_MARKETS;
  public applicationRegions = APPLICATION_REGIONS;
  public scopeTypeRegion = UI_MARKER_SETTINGS.APPLICATION_SCOPE_TYPE_REGION;
  public scopeTypeMarket = UI_MARKER_SETTINGS.APPLICATION_SCOPE_TYPE_MARKET;
  public listOfSelectedRegion: string[] = [];
  public listOfSelectedMarket: string[] = [];
  public selectedMarket: string = '';
  public selectedRegion: string = '';

  ngOnInit() {
    this.sharedStoreService.getSelectedApplicationId()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((id) => {
        this.selectedApplicationId = id;
        this.isOperationDisabled = true;
        if (id === '') {
          this.clearFunctionPages();
        }
      });

    this.sharedStoreService.getSelectedModuleId()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((id) => {
        this.selectedModuleId = id;
        this.isOperationDisabled = true;
        if (id === '') {
          this.clearFunctionPages();
        }
      });

    this.sharedStoreService.getSelectedFunctionId()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((id) => {
        this.selectedFunctionId = id;
        this.isOperationDisabled = false;
        if (id === '') {
          this.clearFunctionPages();
          this.isOperationDisabled = true;
        }
      });

    this.sharedStoreService.getFunctionPages()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((pages) => {
        this.functionPages = pages;
        this.filterFunctionPages(this.selectedViewType, this.listOfSelectedMarket, this.listOfSelectedRegion);
      });

    this.sharedStoreService.getSelectedPageViewType()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((viewType) => {
        this.selectedViewType = viewType;
        // filter the function pages
        this.filterFunctionPages(this.selectedViewType, this.listOfSelectedMarket, this.listOfSelectedRegion);
        // update the nzSize values
        this.updateNzSizeValues(viewType);
      });

    this.sharedStoreService.getApplicationScopeType()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((type) => {
        this.applicationScopeType = type;
      });
    
    this.sharedStoreService.getSelectedMarket()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((markets) => {
        this.listOfSelectedMarket = markets;
        this.filterFunctionPages(this.selectedViewType, this.listOfSelectedMarket, this.listOfSelectedRegion);
      });

    this.sharedStoreService.getSelectedRegion()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((regions) => {
        this.listOfSelectedRegion = regions;
        this.filterFunctionPages(this.selectedViewType, this.listOfSelectedMarket, this.listOfSelectedRegion);
      });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // get the query params from the URL, then update to shared store for subscription
      this.route.queryParams.subscribe(params => {
        let scopeValues = params['scopeValue'] || '';
        // if scopeValues is string, then convert to array
        if (typeof scopeValues === 'string' && scopeValues !== '') {
          scopeValues = [scopeValues];
        }
        if (scopeValues && scopeValues.length > 0) {
          if (this.applicationScopeType === this.scopeTypeMarket) {
            this.sharedStoreService.setSelectedMarket(scopeValues);
          } else if (this.applicationScopeType === this.scopeTypeRegion) {
            this.sharedStoreService.setSelectedRegion(scopeValues);
          }
        } else {
          this.sharedStoreService.setSelectedRegion([]);
        }

        const viewType = params['pageViewType'] || '';
        this.sharedStoreService.setSelectedPageViewType(viewType);

        // clear the functionPages if functionId is null
        const urlFunctionId = params['functionId'] || '';
        if (!urlFunctionId) {
          this.clearFunctionPages();
        }
      });
    }, 100)
  }

  updateNzSizeValues(viewType: string = '') {
    if (viewType) {
      if (viewType === PAGE_VIEW_TYPES[1]) {
        this.updateNzSizeMobileView();
      } else {
        this.updateNzSizeWebView();
      }
    } else {
      this.updateNzSizeWebView()
    }
  }

  updateNzSizeWebView() {
    this.nzXsSize = 24;
    this.nzSmSize = 24;
    this.nzMdSize = 12;
    this.nzLgSize = 12;
    this.nzXlSize = 8;
    this.gridViewCardClass = 'image-card super-width-adapt';
  }

  updateNzSizeMobileView() {
    this.nzXsSize = 24;
    this.nzSmSize = 12;
    this.nzMdSize = 8;
    this.nzLgSize = 6;
    this.nzXlSize = 6;
    this.gridViewCardClass = 'image-card super-width-adapt-mobile';
  }

  filterFunctionPages(viewType: string = '', markets: string[] = [], regions: string[] = []) {
    // filter by viewType
    this.filterFunctionPagesByViewType(viewType);
    
    // continue to filter by market or region
    if (this.applicationScopeType === this.scopeTypeMarket) {
      this.filterFunctionPagesByScopeValue(this.applicationScopeType, markets);
    } else if (this.applicationScopeType === this.scopeTypeRegion) {
      this.filterFunctionPagesByScopeValue(this.applicationScopeType, regions);
    }
    
  }

  filterFunctionPagesByViewType(viewType: string) {
    if (viewType) {
      // if viewType is Mobile, then get the pageViewType === Mobile
      if (viewType === PAGE_VIEW_TYPES[1]) {
        this.filteredFunctionPages = this.functionPages.filter((page) => {
          return page.pageViewType === viewType;
        });
      } else {  // if viewType is not Mobile, then get the pageViewType === Web or null
        this.filteredFunctionPages = this.functionPages.filter((page) => {
          return page.pageViewType === viewType || page.pageViewType === '';
        });
      }
    } else {
      // if view type has no value, check if all the pages' pageViewType is the same, then set this.viewType to this unique pageViewType
      this.filteredFunctionPages = this.functionPages;
      const pageViewTypes = this.filteredFunctionPages.map((page) => page.pageViewType);
      const uniquePageViewTypes = [...new Set(pageViewTypes)];
      if (uniquePageViewTypes.length === 1) {
        const defaultViewType = uniquePageViewTypes[0] || PAGE_VIEW_TYPES[0];
        this.viewTypeChange(defaultViewType);
      }
    }
  }

  filterFunctionPagesByScopeValue(applicationScopeType: string, scopeValues: string[]) {
    // if scopeValue is null, no need to filter
    if (!scopeValues || scopeValues.length === 0) {
      return;
    }
    if (applicationScopeType === this.scopeTypeMarket) {
      this.selectedMarket = scopeValues[0];
    } else if (applicationScopeType === this.scopeTypeRegion) {
      this.selectedRegion = scopeValues[0];
    }
    // get all the scopeValues, and combine all the scopeValues
    // for example if scopeValues = ['APAC', 'EMEA'], then return the filtered records which has scopeValue === 'APAC' or 'EMEA'
    // Loop scopeValues, then do the filter, then combine them together
    let filteredPages: PageListingEntity[] = [];
    scopeValues.forEach((scopeValue) => {
      const tempFilteredFunctionPages = cloneDeep(this.filteredFunctionPages);
      let filtered: PageListingEntity[] = [];
      // if scopeValue is common or '', filter common and ''
      if (scopeValue === 'Common' ||  scopeValue === '') {
        filtered = tempFilteredFunctionPages.filter((page) => {
          return page.scopeValue === scopeValue || page.scopeValue === '';
        });
      } else {
        filtered = tempFilteredFunctionPages.filter((page) => {
          return page.scopeValue === scopeValue;
        });
      }
      filteredPages = filteredPages.concat(filtered);
    });
    this.filteredFunctionPages = filteredPages;
  }

  openUploadDialog() {
    // if selectedApplicationId, selectedModuleId and selectedFunctionId are not empty
    if (this.selectedApplicationId && this.selectedModuleId && this.selectedFunctionId) {
      this.sharedStoreService.setShowUploadImgDialog(true);
    } else {
      this.msg.error('Please select Application, Module and Function in the top drop-down menu');
    }
  }

  setFileUploadParams = () => {
    // if selectedApplicationId, selectedModuleId and selectedFunctionId are not empty
    if (this.selectedApplicationId && this.selectedModuleId && this.selectedFunctionId) {
      return {
        applicationId: this.selectedApplicationId, 
        moduleId: this.selectedModuleId,
        functionId: this.selectedFunctionId
      }
    }
    return null;
  }

  afterImageUpload(emitObj: UploadImageSuppInfo) {
    // update the page details json file
    this.savePageFormDetails(emitObj);
    // get latest function pages
    this.uiMarkerService.getFunctionPages(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId);
  }

  savePageFormDetails(uploadImageSuppInfo: UploadImageSuppInfo) {
    if (uploadImageSuppInfo.selectedPageViewType === '') {
      return;
    }
    const pageFormDetails = {
      'page-view-type': uploadImageSuppInfo.selectedPageViewType,
      'page-desc': uploadImageSuppInfo.pageDescription,
      'scope-value': uploadImageSuppInfo.scopeValue,
      'apiNumber': 0,
      'page-other-supp-txtarea': ''
    };
    this.uiMarkerService.savePageFormDetails(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, uploadImageSuppInfo.pageName, JSON.stringify(pageFormDetails));
  }

  removePageImage(pageUrl: string) {
    // get the image name from pageUrl
    const imageName = pageUrl.split('/').pop() || '';
    this.uiMarkerService.removePageImage(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId, imageName);
  }

  updateToSharedStore() {
    this.sharedStoreService.setFunctionPages(this.functionPages);
  }

  clearFunctionPages() {
    this.sharedStoreService.setFunctionPages([]);
    this.filteredFunctionPages = [];
  }

  viewTypeChange(viewType: string) {
    // this.sharedStoreService.setSelectedPageViewType(viewType);
    // update current url with query param viewType
    this.router.navigate([], {
      queryParams: { pageViewType: viewType },
      queryParamsHandling: 'merge'
    });
  }

  regionChange(selectedRegions: string[]) {
    this.sharedStoreService.setSelectedRegion(selectedRegions);
    // update current url with query param scopeValue
    this.router.navigate([], {
      queryParams: { scopeValue: selectedRegions },
      queryParamsHandling: 'merge'
    });
  }

  marketChange(selectedMarkets: string[]) {
    this.sharedStoreService.setSelectedMarket(selectedMarkets);
    // update current url with query param scopeValue
    this.router.navigate([], {
      queryParams: { scopeValue: selectedMarkets },
      queryParamsHandling: 'merge'
    });
  }

  viewPageDetails(pageUrl: string, pageViewType: string) {
    // clear some shared store values before navigation
    this.sharedStoreService.setElementFormDetails('');
    this.sharedStoreService.setDoubleClickRectId('');
    this.sharedStoreService.setPageFormDetails('');
    this.sharedStoreService.setCanvasMarkerDetails('');
    // set the pageListLoadedFlag, to mark the listing page is loaded
    this.sharedStoreService.setPageListLoadedFlag(true);
    // use angular router to navigate to page-detail component, with req params pageUrl
    const queryParams = {
      applicationId: this.selectedApplicationId,
      moduleId: this.selectedModuleId,
      functionId: this.selectedFunctionId,
      pageUrl: pageUrl,
      pageViewType: pageViewType
    }
    this.urlToolService.navigateTo('/ui-marker/page-detail', queryParams);
  }

  changeListingType(index: number) {
    const clickedValue: string = this.listingTypeOptions[index].value;
    if (this.sharedStoreService.getPageListViewType() !== clickedValue) {
      this.pageListViewType = clickedValue;
      this.sharedStoreService.setPageListViewType(clickedValue);
    }
  }
  
}
