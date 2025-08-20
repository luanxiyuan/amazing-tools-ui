import { Component, Input, EventEmitter, Output } from '@angular/core';
import { SharedStoreService } from '../../../services/common/shared-store.service';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { ERROR_CODE_MAP, PAGE_VIEW_TYPES, UI_MARKER_SETTINGS,
  APPLICATION_MARKETS, APPLICATION_REGIONS } from '../../../consts/sys-consts';
import { get } from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UploadImageSuppInfo } from './upload-image-type';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.css']
})
export class UploadImageComponent {
  constructor(
    public sharedStoreService: SharedStoreService,
    private msg: NzMessageService
  ) {}
  
  @Input() imageUploadURI: string = '';
  @Input() uploadParams: any = {};
  @Input() pageTitle: string = 'Upload a page for your function';
  @Input() uploadNotes: string[] = [];
  @Input() fileExtName: string[] = [];
  @Input() maxSizeMb: number = 5;
  @Output() afterUploadedAction = new EventEmitter<UploadImageSuppInfo>();
  @Input() showPageTitle: boolean = false;
  @Input() applicationScopeType: string = '';
  public applicationMarkets = APPLICATION_MARKETS;
  public applicationRegions = APPLICATION_REGIONS;
  public scopeTypeRegion = UI_MARKER_SETTINGS.APPLICATION_SCOPE_TYPE_REGION;
  public scopeTypeMarket = UI_MARKER_SETTINGS.APPLICATION_SCOPE_TYPE_MARKET;
  @Input() selectedMarket: string = '';
  @Input() selectedRegion: string = '';
  @Input() selectedPageViewType: string = '';
  
  public showUploadImgDialog: boolean = false;
  public imageFileList: NzUploadFile[] = [];
  public uploadSuccessFlag: boolean = false;
  public uploadErrorFlag: boolean = false;
  public fileInfoError: boolean = false;
  public fileInfoErrorMsg: string = '';
  public uploadDoneMsg: string = '';
  public pageViewTypes: Array<string> = PAGE_VIEW_TYPES;
  public pageDescription: string = '';

  public isSpinning: boolean = false;
  public showUploadList: any = {
    showPreviewIcon: false,
    showRemoveIcon: false
  }

  ngOnInit() {
    this.sharedStoreService.getShowUploadImgDialog().subscribe((showUploadImgDialog: boolean) => {
      this.showUploadImgDialog = showUploadImgDialog;
      // clean the parameters when opening up the image upload popup
      if (showUploadImgDialog) {
        this.imageFileList = [];
        this.fileInfoError = false;
        this.uploadSuccessFlag = false;
        this.uploadErrorFlag = false;
        this.uploadDoneMsg = '';
      }
    });
    this.setDefaultViewType();
    this.setDefaultMarket();
    this.setDefaultRegion();
  }

  setDefaultViewType() {
    if (!this.selectedPageViewType) {
      this.selectedPageViewType = PAGE_VIEW_TYPES[0];
    }
  }

  setDefaultMarket() {
    if (!this.selectedMarket) {
      this.selectedMarket = APPLICATION_MARKETS[0];
    }
  }

  setDefaultRegion() {
    if (!this.selectedRegion) {
      this.selectedRegion = APPLICATION_REGIONS[0];
    }
  }

  closeUploadImgDialog() {
    this.sharedStoreService.setShowUploadImgDialog(false);
  }

  beforeUpload = (file: NzUploadFile, _fileList: NzUploadFile[]): boolean => {
    if (!this.selectedPageViewType) { 
      this.msg.error('Please select a page view type');
      return false;
    }
    let fileTypeList = ['image/png', 'image/jpeg', 'image/jpg', 'image/PNG', 'image/JPEG', 'image/JPG'];
    // if fileExtName is not empty then use it
    if(this.fileExtName.length > 0) {
      fileTypeList.length = 0;
      fileTypeList.push(...this.fileExtName);
    }
    const isLtMaxSize = file.size! / 1024 / 1024 < this.maxSizeMb;
    this.imageFileList = [];
    this.uploadSuccessFlag = false;
    this.uploadErrorFlag = false;
    if (!(file.type && fileTypeList.includes(file.type))) {
      this.fileInfoError = true;
      this.fileInfoErrorMsg = 'Image type is not supported';
      return false;
    } else if(!isLtMaxSize) {
      this.fileInfoError = true;
      this.fileInfoErrorMsg = 'Image size should be less than ' + this.maxSizeMb + 'MB';
      return false;
    } else {
      this.fileInfoError = false;
      return true
    }
  }

  handleChange(info: NzUploadChangeParam): void {
    this.isSpinning = true;
    this.imageFileList = [info.fileList[info.fileList.length - 1]];
    const status = info.file.status;
    if (status === 'done') {
      this.uploadSuccessFlag = true;
      this.uploadErrorFlag = false;
      this.uploadDoneMsg = get(info, "file.response.message", 'Image uploaded successfully');
      // call function after image uploaded
      let emitObject: UploadImageSuppInfo = {
        pageName: get(info, 'file.response.pageName', '')
      }
      if (this.showPageTitle) {
        // add a new field 'pageDescription' in emitObject
        emitObject = { ...emitObject, pageDescription: this.pageDescription }
      }
      if (this.selectedPageViewType) {
        // add a new field 'selectedPageViewType' in emitObject
        emitObject = { ...emitObject, selectedPageViewType: this.selectedPageViewType }
      }
      if (this.applicationScopeType === this.scopeTypeRegion) {
        // add a new field 'applicatioScopeTypeValue' in emitObject
        emitObject = { ...emitObject, scopeValue: this.selectedRegion }
      }
      if (this.applicationScopeType === this.scopeTypeMarket) {
        // add a new field 'applicatioScopeTypeValue' in emitObject
        emitObject = { ...emitObject, scopeValue: this.selectedMarket }
      }
      this.afterUploadedAction.emit(emitObject);
    } else if (status === 'error') {
      const apiErrorMessage = get(info, 'file.error.error.message', '');
      const httpErrorStatus = get(info, 'file.error.status', '');
      if(apiErrorMessage) { //display api error message on priority
        this.uploadDoneMsg = apiErrorMessage;
      } else if(httpErrorStatus) {
        // get the value from ERROR_CODE_MAP which value == httpErrorStatus
        const errorMessage: string = get(ERROR_CODE_MAP, httpErrorStatus, '');
        this.uploadDoneMsg = errorMessage ? errorMessage : get(info, 'file.error.statusText', '');
      } else {  //display default error message in the last case
        this.uploadDoneMsg = 'Image uploaded failed';
      }
      this.uploadSuccessFlag = false;
      this.uploadErrorFlag = true;
    }
    this.isSpinning = false;
  }
}
