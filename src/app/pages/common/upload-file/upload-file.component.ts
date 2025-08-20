import { Component, EventEmitter, Input, Output } from '@angular/core';
import { get } from 'lodash';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { ERROR_CODE_MAP } from '../../../consts/sys-consts';
import { SharedStoreService } from '../../../services/common/shared-store.service';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent {

  constructor(
    public sharedStoreService: SharedStoreService
  ) {}
  
  @Input() fileUploadURI: string = '';
  @Input() uploadParams: any = {};
  @Input() pageTitle: string = 'Upload a screenshot for your function';
  @Input() uploadNotes: string[] = [];
  @Input() maxSizeMb: number = 5;
  @Input() fileExtName: string[] = [];
  @Output() afterUploadedAction = new EventEmitter<string>();
  
  public fileFileList: NzUploadFile[] = [];
  public uploadSuccessFlag: boolean = false;
  public uploadErrorFlag: boolean = false;
  public fileInfoError: boolean = false;
  public fileInfoErrorMsg: string = '';
  public uploadDoneMsg: string = '';

  public isSpinning: boolean = false;
  public showUploadList: any = {
    showPreviewIcon: false,
    showRemoveIcon: false
  }

  ngOnInit() {
    // clean the parameters when opening up the file upload popup
    this.fileFileList = [];
    this.fileInfoError = false;
    this.uploadSuccessFlag = false;
    this.uploadErrorFlag = false;
    this.uploadDoneMsg = '';
  }

  beforeUpload = (file: NzUploadFile, _fileList: NzUploadFile[]): boolean => {
    let fileTypeList = [];
    // if fileExtName is not empty then use it
    if(this.fileExtName.length > 0) {
      fileTypeList.length = 0;
      fileTypeList.push(...this.fileExtName);
    }
    const isLtMaxSize = file.size! / 1024 / 1024 < this.maxSizeMb;
    this.fileFileList = [];
    this.uploadSuccessFlag = false;
    this.uploadErrorFlag = false;
    if (!this.validateFileExtName(file)) {
      this.fileInfoError = true;
      this.fileInfoErrorMsg = 'File ext name is not supported';
      return false;
    } else if (!this.validateFileType(file)) {
      this.fileInfoError = true;
      this.fileInfoErrorMsg = 'File type is not supported';
      return false;
    } else if(!isLtMaxSize) {
      this.fileInfoError = true;
      this.fileInfoErrorMsg = 'File size should be less than ' + this.maxSizeMb + 'MB';
      return false;
    } else {
      this.fileInfoError = false;
      return true
    }
  }

  validateFileType(file: NzUploadFile): boolean {
    // for some file type such as xsd, file.type is null, we need to skip the validation in this case
    if (!file.type) {
      return true;
    }
    let fileTypeList: string[] = [];
    // if fileExtName is not empty then use it
    if(this.fileExtName.length > 0) {
      // loop through the fileExtName, 
      // if it's png, then put the value 'image/png' in fileTypeList
      // if it's jpg or jpeg, then put the value 'image/jpeg' in fileTypeList
      // if it's pdf, then put the value 'application/pdf' in fileTypeList
      // other cases, put the original value in fileTypeList
      fileTypeList.length = 0;
      this.fileExtName.forEach((extName) => {
        switch (extName) {
          case 'png':
            fileTypeList.push('image/png');
            break;
          case 'jpg':
          case 'jpeg':
            fileTypeList.push('image/jpeg');
            break;
          case 'pdf':
            fileTypeList.push('application/pdf');
            break;
          default:
            fileTypeList.push(extName);
        }
      });
      // fileTypeList.push(...this.fileExtName);
    }
    return fileTypeList.includes(file.type) || false;
  }

  validateFileExtName(file: NzUploadFile): boolean {
    const uploadedFileExtName = file.name.split('.').pop() || '';
    // if fileExtName is not empty then use it
    if(this.fileExtName.length > 0) {
      return this.fileExtName.includes(uploadedFileExtName);
    }
    return true;
  }

  handleChange(info: NzUploadChangeParam): void {
    this.isSpinning = true;
    this.fileFileList = [info.fileList[info.fileList.length - 1]];
    const status = info.file.status;
    if (status === 'done') {
      this.uploadSuccessFlag = true;
      this.uploadErrorFlag = false;
      this.uploadDoneMsg = info.file.response ? info.file.response.message : 'File uploaded successfully';
      const downloadFileName = get(info, 'file.response.downloadFileName', '');
      // call function after file uploaded
      this.afterUploadedAction.emit(downloadFileName);
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
        this.uploadDoneMsg = 'File uploaded failed';
      }
      this.uploadSuccessFlag = false;
      this.uploadErrorFlag = true;
    }
    this.isSpinning = false;
  }
}
