import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MODULE_TITLES, XSD_CONVERTER_SETTINGS, XSD_CONVERTER_URIS, XSD_UPLOAD_NOTES } from '../../consts/sys-consts';
import { FaviconService } from '../../services/common/favicon.service';
import { HttpClientService } from '../../services/common/http-client.service';

@Component({
  selector: 'app-xsd-converter',
  templateUrl: './xsd-converter.component.html',
  styleUrls: ['./xsd-converter.component.css']
})
export class XsdConverterComponent {
  
  private faviconPath: string = XSD_CONVERTER_SETTINGS.FAVICON_PATH;
  public fileUploadNotes: string[] = XSD_UPLOAD_NOTES;
  public fileUploadURI: string = XSD_CONVERTER_URIS.XSD_UPLOAD_CONVERT;
  packageName: string = '';

  constructor(
    private titleService: Title,
    private faviconService: FaviconService,
    private httpClientService: HttpClientService
  ) {
    // set the module title
    this.setTitle(MODULE_TITLES.XSD_CONVERTER);
    this.faviconService.setFavicon(this.faviconPath);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
  }

  setFileUploadParams = () => {
    if (this.packageName) {
      return {
        packageName: this.packageName
      }
    }
    return null;
  }

  afterFileUpload(downloadFileName: string) {
    let xsdJavaDownloadUri: string = XSD_CONVERTER_URIS.XSD_DOWNLOAD_JAVA_FILE;
    // add parameter fileName to the download URI
    xsdJavaDownloadUri += `?fileName=${downloadFileName}`;
    this.httpClientService.downloadFile(xsdJavaDownloadUri, XSD_CONVERTER_SETTINGS.JAVA_ZIP_FILE_NAME);
  }
}
