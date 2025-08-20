import { Component } from '@angular/core';
import { BASE64_CONVERTER_SETTINGS, BASE64_FILE_UPLOAD_NOTES, MODULE_TITLES } from '../../consts/sys-consts';
import { Title } from '@angular/platform-browser';
import { FaviconService } from '../../services/common/favicon.service';
import { StringToolService } from '../../services/common/string-tool.service';
import { FileToolService } from '../../services/common/file-tool.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-base64-converter',
  templateUrl: './base64-converter.component.html',
  styleUrls: ['./base64-converter.component.css']
})
export class Base64ConverterComponent {

  
  private faviconPath: string = BASE64_CONVERTER_SETTINGS.FAVICON_PATH;
  public fileUploadNotes: string[] = BASE64_FILE_UPLOAD_NOTES;
  public fileUploadURI: string = '';  // leave as empty as no need to upload to server
  tabName: string = 'fileToBase64';
  base64String: string = '';

  maxSizeMb: number = BASE64_CONVERTER_SETTINGS.MAX_FILE_SIZE_MB;
  fileInfoErrorMsg: string = '';
  allowedFileTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf']; // Add more types as needed
  base64SourceText: string = '';
  fileName: string = BASE64_CONVERTER_SETTINGS.FILE_NAME_PREFIX;

  constructor(
    private titleService: Title,
    private faviconService: FaviconService,
    private stringToolService: StringToolService,
    private msg: NzMessageService,
    private fileToolService: FileToolService
  ) {
    // set the module title
    this.setTitle(MODULE_TITLES.BASE64_CONVERTER);
    this.faviconService.setFavicon(this.faviconPath);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate the file
      if (!this.validateFile(file)) {
        return;
      }

      // Process the file locally
      this.processFile(file);
    }
  }

  clearAfterFileSelected() {
    this.fileInfoErrorMsg = '';
    this.base64String = '';
  }

  validateFile(file: File): boolean {
    // Validate file type
    const isSupportedType = this.fileToolService.validateFileType(file, this.allowedFileTypes);
    if (!isSupportedType) {
      this.fileInfoErrorMsg = 'File type is not supported';
      return false;
    }
    // Validate file size
    const isLtMaxSize = this.fileToolService.validateFileSize(file, this.maxSizeMb);
    if (!isLtMaxSize) {
      this.fileInfoErrorMsg = 'File size should be less than ' + this.maxSizeMb + 'MB';
      return false;
    }

    this.fileInfoErrorMsg = ''; // Reset error message if validation passes
    return true;
  }

  processFile(file: File): void {
    this.fileToolService.convertFileToBase64(file).subscribe({
      next: (base64Content: string) => {
        this.base64String = base64Content;
      },
      error: (error) => {
        console.error('Error reading file:', error);
      }
    });
  }

  switchTab(tabName: string) {
    this.tabName = tabName;
  }

  copyToClipboard(value: string): void {
    this.stringToolService.copyToClipboard(value);
  }

  convertBase64ToFile() {
    if (!this.base64SourceText) {
      this.msg.error('Empty Base64 string.');
      return;
    }

    const file = this.fileToolService.convertBase64ToFile(this.base64SourceText, this.fileName);
    if (!file) {
      this.msg.error('Invalid Base64 string.');
      return;
    }

    // download file
    this.fileToolService.downloadFile(file);
  }
}
