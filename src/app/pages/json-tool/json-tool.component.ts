import { Component } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { JSON_TOOL_SETTINGS, MODULE_TITLES } from '../../consts/sys-consts';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { FaviconService } from '../../services/common/favicon.service';
import { StringToolService } from '../../services/common/string-tool.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { JsonToolService } from '../../services/json-tool/json-tool.service';
import { JsonLabelFinderResult } from '../../types/json-tool-type';

@Component({
  selector: 'app-json-tool',
  templateUrl: './json-tool.component.html',
  styleUrls: ['./json-tool.component.css']
})
export class JsonToolComponent extends BaseComponent {

  private faviconPath: string = JSON_TOOL_SETTINGS.FAVICON_PATH;
  badgeOverflowCount: number = JSON_TOOL_SETTINGS.BADGE_OVERFLOW_COUNT;

  jsonFormForValueSearch: FormGroup;
  jsonFormForKeySearch: FormGroup;
  jsonFormForValueExtract: FormGroup;
  labelFinderResultsByValue: JsonLabelFinderResult[] = [];
  labelFinderResultsByKey: JsonLabelFinderResult[] = [];
  extractedValueList: string[] = [];
  currentFindingByValue: string = '';
  currentFindingByKey: string = '';
  searchType: string = 'value';

  constructor(
    private jsonToolService: JsonToolService,
    private stringToolService: StringToolService,
    private msg: NzMessageService,
    private titleService: Title,
    private faviconService: FaviconService
  ) {
    super();
    
    //update the title and favicon for this module
    this.setTitle(MODULE_TITLES.JSON_TOOL);
    this.faviconService.setFavicon(this.faviconPath);
    
    this.jsonFormForValueSearch = new FormGroup({
      labelValue: new FormControl('', Validators.required),
      sourceJson: new FormControl('', Validators.required)
    });

    this.jsonFormForKeySearch = new FormGroup({
      labelKey: new FormControl('', Validators.required),
      sourceJson: new FormControl('', Validators.required)
    });

    this.jsonFormForValueExtract = new FormGroup({
      sourceJson: new FormControl(`{\n\n}`, Validators.required)
    });
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit(): void {
  }

  findJsonLabelByValue(): void {
    if (this.jsonFormForValueSearch.valid) {
      // get the labelValue from jsonFormForValueSearch, if labelValue is empty, message error
      const labelValue = this.jsonFormForValueSearch.get('labelValue')?.value;
      if (!labelValue.trim()) {
        this.msg.error('Json node value is required');
        return;
      }
      // get the sourceJson from jsonFormForValueSearch
      const sourceJson = this.jsonFormForValueSearch.get('sourceJson')?.value;
      if (!sourceJson || !this.stringToolService.isValidJson(sourceJson)) {
        this.msg.error('Invalid JSON format');
        return;
      }

      this.clearByValueResults();

      this.labelFinderResultsByValue = this.jsonToolService.getAllPathsByValue(JSON.parse(sourceJson), labelValue);
      this.currentFindingByValue = labelValue;
    }
  }

  findJsonLabelByKey(): void {
    if (this.jsonFormForKeySearch.valid) {
      // get the labelKey from jsonFormForKeySearch, if labelKey is empty, message error
      const labelKey = this.jsonFormForKeySearch.get('labelKey')?.value;
      if (!labelKey.trim()) {
        this.msg.error('Json node key is required');
        return;
      }
      // get the sourceJson from jsonFormForKeySearch
      const sourceJson = this.jsonFormForKeySearch.get('sourceJson')?.value;
      if (!sourceJson || !this.stringToolService.isValidJson(sourceJson)) {
        this.msg.error('Invalid JSON format');
        return;
      }

      this.clearByKeyResults();

      this.labelFinderResultsByKey = this.jsonToolService.getAllPathsByKey(JSON.parse(sourceJson), labelKey);
      // format the value which type of object
      this.formatJsonValue(this.labelFinderResultsByKey);
      this.currentFindingByKey = labelKey;
    }
  }

  extractJsonValueList(): void {
    if (this.jsonFormForValueExtract.valid) {
      // get the sourceJson from jsonFormForValueExtract
      const sourceJson = this.jsonFormForValueExtract.get('sourceJson')?.value;
      if (!sourceJson || !this.stringToolService.isValidJson(sourceJson)) {
        this.msg.error('Invalid JSON format');
        return;
      }
      // get the value list from jsonToolService
      this.extractedValueList = this.jsonToolService.extractValueList(JSON.parse(sourceJson));
    }
  }

  formatJsonValue(sourceJson: JsonLabelFinderResult[]): void {
    // if sourceJson is empty, return
    if (sourceJson.length === 0) {
      return;
    }
    // loop through sourceJson and format the value
    sourceJson.forEach((item: JsonLabelFinderResult) => {
      // if item.value is not a string, convert it to string
      if (typeof item.value !== 'string') {
        item.value = JSON.stringify(item.value);
      }
    });
  }

  clearByValueResults(): void {
    this.currentFindingByValue = '';
    this.labelFinderResultsByValue = [];
  }

  clearByKeyResults(): void {
    this.currentFindingByKey = '';
    this.labelFinderResultsByKey = [];
  }

  clearInputLabelValue() {
    this.jsonFormForValueSearch.get('labelValue')?.setValue(null);
  }

  clearInputLabelKey() {
    this.jsonFormForKeySearch.get('labelKey')?.setValue(null);
  }

  switchSearchType(type: string) {
    this.searchType = type;
  }

}
