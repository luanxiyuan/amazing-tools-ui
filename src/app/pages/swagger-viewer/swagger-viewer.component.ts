import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MODULE_TITLES, SWAGGER_VIEWER_SETTINGS, SWAGGER_VIEWER_URIS } from '../../consts/sys-consts';
import { FaviconService } from '../../services/common/favicon.service';
import { HttpClientService } from '../../services/common/http-client.service';
import { StringToolService } from '../../services/common/string-tool.service';
import SwaggerUI from 'swagger-ui';
import { parse } from 'yaml';

@Component({
  selector: 'app-swagger-viewer',
  templateUrl: './swagger-viewer.component.html',
  styleUrls: ['./swagger-viewer.component.css']
})
export class SwaggerViewerComponent {

  swaggerJsonForm: FormGroup;
  swaggerYamlForm: FormGroup;
  private faviconPath: string = SWAGGER_VIEWER_SETTINGS.FAVICON_PATH;
  isVsCodePluginPopupVisible = false;

  constructor(
    private stringToolService: StringToolService,
    private msg: NzMessageService,
    private titleService: Title,
    private faviconService: FaviconService,
    private httpClientService: HttpClientService
  ) {
    // set the module title
    this.setTitle(MODULE_TITLES.SWAGGER_VIEWER);
    this.faviconService.setFavicon(this.faviconPath);
    
    this.swaggerJsonForm = new FormGroup({
      swaggerJson: new FormControl('', Validators.required)
    });
    this.swaggerYamlForm = new FormGroup({
      swaggerYaml: new FormControl('', Validators.required)
    });
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit(): void {
    this.loadSwaggerUICSS();
  }

  loadSwaggerUICSS(): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/css/swagger-ui.css';
    document.head.appendChild(link);
  }

  viewSwaggerWithJson(): void {
    if (this.swaggerJsonForm.valid) {
      // clear the content of the swagger-ui div
      document.getElementById('swagger-ui')!.innerHTML = '';
      // get the value of the form control
      const swaggerJson = this.swaggerJsonForm.get('swaggerJson')?.value;
      // check if this is a valid json format
      if (this.stringToolService.isValidJson(swaggerJson)) {
        SwaggerUI({
          dom_id: '#swagger-ui',
          spec: JSON.parse(swaggerJson)
        });
      } else {
        this.msg.error('Invalid JSON format');
      }
    } else {
      Object.values(this.swaggerJsonForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  viewSwaggerWithYaml(): void {
    if (this.swaggerYamlForm.valid) {
      // clear the content of the swagger-ui div
      document.getElementById('swagger-ui')!.innerHTML = '';
      try {
        // get the value of the form control
        const swaggerYaml = this.swaggerYamlForm.get('swaggerYaml')?.value;
        const swaggerYamlObj = parse(swaggerYaml) as Record<string, any>;
        const swaggerJson = JSON.stringify(swaggerYamlObj);
        SwaggerUI({
          dom_id: '#swagger-ui',
          spec: JSON.parse(swaggerJson)
        });
      } catch (e) {
        this.msg.error('Invalid Yaml format');
      }
    } else {
      Object.values(this.swaggerYamlForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  openVscodePluginModal(): void {
    this.isVsCodePluginPopupVisible = true;
  }

  closeVsCodePluginPopup(): void {
    this.isVsCodePluginPopupVisible = false;
  }

  downloadVsCodePlugin() {
    const downloadLink = SWAGGER_VIEWER_URIS.VSCODE_PLUGIN;
    this.httpClientService.downloadFile(downloadLink, SWAGGER_VIEWER_SETTINGS.VSCODE_PLUGIN_FILE_NAME);
  }

}
