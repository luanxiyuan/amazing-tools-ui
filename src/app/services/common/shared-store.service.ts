import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CanvasMarkerPopup, PageListingEntity, UiApiRelation } from '../../types/ui-marker-type';

@Injectable({
  providedIn: 'root'
})
export class SharedStoreService {
  private selectedApplicationId = new BehaviorSubject<string>('');
  private selectedModuleId = new BehaviorSubject<string>('');
  private selectedFunctionId = new BehaviorSubject<string>('');
  private functionPages = new BehaviorSubject<PageListingEntity[]>([]);

  private pageListViewType: string = 'Grid';
  private pageListLoadedFlag = new BehaviorSubject<boolean>(false);

  private elementEditDrawerVisible = new BehaviorSubject<boolean>(false);
  private elementViewDrawerVisible = new BehaviorSubject<boolean>(false);
  private pageEditDrawerVisible = new BehaviorSubject<boolean>(false);
  private pageViewDrawerVisible = new BehaviorSubject<boolean>(false);
  private selectedRectId = new BehaviorSubject<string>('');
  private doubleClickRectId = new BehaviorSubject<string>('');

  private canvasMarkerDetails = new BehaviorSubject<string>('');

  private elementFormDetails = new BehaviorSubject<string>('');
  private pageFormDetails = new BehaviorSubject<string>('');

  private _loading = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this._loading.asObservable();

  private elementFormViewable = new BehaviorSubject<boolean>(false);
  public readonly elementFormViewable$ = this.elementFormViewable.asObservable();

  private pageFormViewable = new BehaviorSubject<boolean>(false);
  public readonly pageFormViewable$ = this.pageFormViewable.asObservable();

  private showUploadImgDialog = new BehaviorSubject<boolean>(false);

  private teamUpdateResultFlag = new BehaviorSubject<boolean>(false);
  private personUpdateResultFlag = new BehaviorSubject<boolean>(false);

  private abbreviationResultFlag = new BehaviorSubject<boolean>(false);
  private abbreviationTotalCount = new BehaviorSubject<number>(0);

  private contactsTabValue = new BehaviorSubject<'team' | 'person'>('team');
  private detailPageViewTypeChangeFlag = new BehaviorSubject<boolean>(false);
  private selectedPageViewType = new BehaviorSubject<string>('');

  private canvasMarkerPopup = new BehaviorSubject<CanvasMarkerPopup>({ visible: false, left: 0, top: 0 });
  private applicationScopeType = new BehaviorSubject<string>('');
  private selectedRegions = new BehaviorSubject<string[]>([]);
  private selectedMarkets = new BehaviorSubject<string[]>([]);

  private openAndPrivateApiUpdateResultFlag = new BehaviorSubject<boolean>(false);
  private listOfUiApiRelationData = new BehaviorSubject<UiApiRelation[]>([]);

  getUiApiRelationData() {
    return this.listOfUiApiRelationData.asObservable();
  }

  setUiApiRelationData(data: UiApiRelation[]) {
    this.listOfUiApiRelationData.next(data);
  }

  getOpenAndPrivateApiUpdateResultFlag() {
    return this.openAndPrivateApiUpdateResultFlag.asObservable();
  }

  setOpenAndPrivateApiUpdateResultFlag(flag: boolean) {
    this.openAndPrivateApiUpdateResultFlag.next(flag);
  }

  getSelectedMarket() {
    return this.selectedMarkets.asObservable();
  }

  setSelectedMarket(markets: string[]) {
    this.selectedMarkets.next(markets);
  }

  getSelectedRegion() {
    return this.selectedRegions.asObservable();
  }

  setSelectedRegion(regions: string[]) {
    this.selectedRegions.next(regions);
  }

  getApplicationScopeType() {
    return this.applicationScopeType.asObservable();
  }

  setApplicationScopeType(type: string) {
    this.applicationScopeType.next(type);
  }

  getCanvasMarkerPopup() {
    return this.canvasMarkerPopup.asObservable();
  }

  setCanvasMarkerPopup(popup: CanvasMarkerPopup) {
    this.canvasMarkerPopup.next(popup);
  }

  getSelectedPageViewType() {
    return this.selectedPageViewType.asObservable();
  }

  setSelectedPageViewType(type: string) {
    this.selectedPageViewType.next(type);
  }

  getDetailPageViewTypeChangeFlag() {
    return this.detailPageViewTypeChangeFlag.asObservable();
  }

  setDetailPageViewTypeChangeFlag(flag: boolean) {
    this.detailPageViewTypeChangeFlag.next(flag);
  }

  getAbbreviationTotalCount() {
    return this.abbreviationTotalCount.asObservable();
  }

  setAbbreviationTotalCount(count: number) {
    this.abbreviationTotalCount.next(count);
  }

  getAbbreviationResultFlag() {
    return this.abbreviationResultFlag.asObservable();
  }

  setAbbreviationResultFlag(flag: boolean) {
    this.abbreviationResultFlag.next(flag);
  }

  setContactsTabValue(value: 'team' | 'person') {
    this.contactsTabValue.next(value);
  }

  getContactsTabValue() {
    return this.contactsTabValue.asObservable();
  }

  setPersonUpdateResultFlag(flag: boolean) {
    this.personUpdateResultFlag.next(flag);
  }

  getPersonUpdateResultFlag() {
    return this.personUpdateResultFlag.asObservable();
  }

  setTeamUpdateResultFlag(flag: boolean) {
    this.teamUpdateResultFlag.next(flag);
  }

  getTeamUpdateResultFlag() {
    return this.teamUpdateResultFlag.asObservable();
  }

  setLoading(value: boolean) {
    this._loading.next(value);
  }

  setElementFormViewable(value: boolean) {
    this.elementFormViewable.next(value);
  }

  setPageFormViewable(value: boolean) {
    this.pageFormViewable.next(value);
  }

  setShowUploadImgDialog(value: boolean) {
    this.showUploadImgDialog.next(value);
  }

  getShowUploadImgDialog() {
    return this.showUploadImgDialog.asObservable();
  }

  setSelectedApplicationId(id: string) {
    this.selectedApplicationId.next(id);
  }

  getSelectedApplicationId() {
    return this.selectedApplicationId.asObservable();
  }

  setSelectedModuleId(id: string) {
    this.selectedModuleId.next(id);
  }

  getSelectedModuleId() {
    return this.selectedModuleId.asObservable();
  }

  setSelectedFunctionId(id: string) {
    this.selectedFunctionId.next(id);
  }

  getSelectedFunctionId() {
    return this.selectedFunctionId.asObservable();
  }

  setFunctionPages(pages: PageListingEntity[]) {
    this.functionPages.next(pages);
  }

  getFunctionPages() {
    return this.functionPages.asObservable();
  }

  setPageListViewType(type: string) {
    this.pageListViewType = type;
  }

  getPageListViewType() {
    return this.pageListViewType;
  }

  setPageListLoadedFlag(flag: boolean) {
    this.pageListLoadedFlag.next(flag);
  }

  getPageListLoadedFlag() {
    return this.pageListLoadedFlag.asObservable();
  }

  setElementEditDrawerVisible(flag: boolean) {
    this.elementEditDrawerVisible.next(flag);
  }

  getElementEditDrawerVisible() {
    return this.elementEditDrawerVisible.asObservable();
  }

  setElementViewDrawerVisible(flag: boolean) {
    this.elementViewDrawerVisible.next(flag);
  }

  getElementViewDrawerVisible() {
    return this.elementViewDrawerVisible.asObservable();
  }

  setPageEditDrawerVisible(flag: boolean) {
    this.pageEditDrawerVisible.next(flag);
  }

  getPageEditDrawerVisible() {
    return this.pageEditDrawerVisible.asObservable();
  }

  setPageViewDrawerVisible(flag: boolean) {
    this.pageViewDrawerVisible.next(flag);
  }

  getPageViewDrawerVisible() {
    return this.pageViewDrawerVisible.asObservable();
  }

  setSelectedRectId(id: string) {
    this.selectedRectId.next(id);
  }

  getSelectedRectId() {
    return this.selectedRectId.asObservable();
  }

  setCanvasMarkerDetails(details: string) {
    this.canvasMarkerDetails.next(details);
  }

  getCanvasMarkerDetails() {
    return this.canvasMarkerDetails.asObservable();
  }

  setElementFormDetails(details: string) {
    this.elementFormDetails.next(details);
  }

  getElementFormDetails() {
    return this.elementFormDetails.asObservable();
  }

  setPageFormDetails(details: string) {
    this.pageFormDetails.next(details);
  }

  getPageFormDetails() {
    return this.pageFormDetails.asObservable();
  }

  setDoubleClickRectId(id: string) {
    this.doubleClickRectId.next(id);
  }

  getDoubleClickRectId() {
    return this.doubleClickRectId.asObservable();
  }

}