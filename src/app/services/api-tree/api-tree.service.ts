import { Injectable } from '@angular/core';
import { OpenAndPrivateApi } from '../../types/api-tree-type';
import { HttpClientService } from '../common/http-client.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SharedStoreService } from '../common/shared-store.service';
import { HttpParams } from '@angular/common/http';
import { API_TREE_SETTINGS, API_TREE_URIS, UI_MARKER_URIS, URI_SEARCH_MODES } from '../../consts/sys-consts';
import { cloneDeep, get } from 'lodash-es';
import { catchError, map } from 'rxjs';
import { UiApiRelation } from '../../types/ui-marker-type';
import { UrlToolService } from '../common/url-tool.service';

@Injectable({
  providedIn: 'root'
})
export class ApiTreeService {

  constructor(
    private httpClientService: HttpClientService,
    private msg: NzMessageService,
    private sharedStoreService: SharedStoreService,
    private urlToolService: UrlToolService
  ) { }

  addOpenAndPrivateApi(openAndPrivateApi: OpenAndPrivateApi) {
    // write a function to send http request to update the team
    this.sharedStoreService.setLoading(true);
    let params = new HttpParams();
    params = params.append('api_entity', JSON.stringify(openAndPrivateApi));
    this.httpClientService.post(API_TREE_URIS.ADD_API, params).subscribe({
      next: (data) => {
        this.sharedStoreService.setLoading(false);
        if (get(data, 'status') === "success") {
          this.msg.success('Open API added successfully.');
          this.sharedStoreService.setOpenAndPrivateApiUpdateResultFlag(true);
        } else {
          this.msg.error('Open API added failed');
        }
      },
      error: (error) => {
        this.sharedStoreService.setLoading(false);
        if (get(error, 'error.message')) {
          this.msg.error(get(error, 'error.message'));
        } else {
          this.msg.error('Open API added failed');
        }
      },
      complete: () => {}
    });
  }

  // this is for silent sync the apis' details with Odyssey X - api
  addOpenApis(openAndPrivateApis: OpenAndPrivateApi[]) {
    let params = new HttpParams();
    params = params.append('api_entities', JSON.stringify(openAndPrivateApis));
    this.httpClientService.post(API_TREE_URIS.ADD_OPEN_APIS, params).subscribe({
      // it doesn't matter if successful or not, we just want to sync the data
    });
  }

  updateOpenAndPrivateApi(openAndPrivateApi: OpenAndPrivateApi) {
    // write a function to send http request to update the team
    this.sharedStoreService.setLoading(true);
    let params = new HttpParams();
    params = params.append('api_entity', JSON.stringify(openAndPrivateApi));
    this.httpClientService.put(API_TREE_URIS.UPDATE_API, params).subscribe({
      next: (data) => {
        this.sharedStoreService.setLoading(false);
        if (get(data, 'status') === "success") {
          this.msg.success('Open API updated successfully.');
          this.sharedStoreService.setOpenAndPrivateApiUpdateResultFlag(true);
        } else {
          this.msg.error('Open API updated failed');
        }
      },
      error: (error) => {
        this.sharedStoreService.setLoading(false);
        if (get(error, 'error.message')) {
          this.msg.error(get(error, 'error.message'));
        } else {
          this.msg.error('Open API updated failed');
        }
      },
      complete: () => {}
    });
  }

  getOpenAndPrivateApis() {
    let openAndPrivateApis: OpenAndPrivateApi[] = [];
    this.sharedStoreService.setLoading(true);
    return this.httpClientService.get(API_TREE_URIS.GET_APIS).pipe(
      map(data => {
        this.sharedStoreService.setLoading(false);
        openAndPrivateApis = data as OpenAndPrivateApi[];
        // Sort the data by createTime in descending order
        openAndPrivateApis.sort((a, b) => {
          const dateA = a.createTime;
          const dateB = b.createTime;
          return dateB.localeCompare(dateA);
        });
        return openAndPrivateApis;
      }),
      catchError(error => {
        this.sharedStoreService.setLoading(false);
        this.msg.error('An error occurred while fetching Open APIs');
        return [];
      })
    )
  }

  filterOpenAndPrivateApis(
    openAndPrivateApis: OpenAndPrivateApi[], 
    uri: string = '',
    uriSearchMode: string = URI_SEARCH_MODES[0],
    httpMethod: string,
    classification: string,
    belongsToApplication: string,
    channel: string,
    swaggerTitle: string,
    apiName: string
  ): OpenAndPrivateApi[] {
    let tempOpenAndPrivateApis = cloneDeep(openAndPrivateApis);
    // in case the uri has the variable in the path, such as /v1/investments/mutualFunds/{0}/settlementAccounts, please match {0} to anything such as {accountid} or something
    if (uri) {
      if (uriSearchMode === URI_SEARCH_MODES[0]) {   // partial match
        tempOpenAndPrivateApis = tempOpenAndPrivateApis.filter(openAndPrivateApi => {
          return this.urlToolService.partialMatchUriWithVariables(uri, openAndPrivateApi.uri);
        });
      } else {    // exact match
        tempOpenAndPrivateApis = tempOpenAndPrivateApis.filter(openAndPrivateApi => {
          return this.urlToolService.exactMatchUriWithVariables(uri, openAndPrivateApi.uri);
        });
      }
    }
    if (httpMethod) {
      tempOpenAndPrivateApis = tempOpenAndPrivateApis.filter(openAndPrivateApi => openAndPrivateApi.httpMethod.toLowerCase().includes(httpMethod.toLowerCase()));
    }
    if (classification) {
      tempOpenAndPrivateApis = tempOpenAndPrivateApis.filter(openAndPrivateApi => openAndPrivateApi.classification.toLowerCase().includes(classification.toLowerCase()));
    }
    if (belongsToApplication) {
      tempOpenAndPrivateApis = tempOpenAndPrivateApis.filter(openAndPrivateApi => openAndPrivateApi.belongsToApplication.includes(belongsToApplication));
    }
    if (channel) {
      tempOpenAndPrivateApis = tempOpenAndPrivateApis.filter(openAndPrivateApi => openAndPrivateApi.channel.toLowerCase().includes(channel.toLowerCase()));
    }
    if (swaggerTitle) {
      tempOpenAndPrivateApis = tempOpenAndPrivateApis.filter(openAndPrivateApi => openAndPrivateApi.swaggerTitle.toLowerCase().includes(swaggerTitle.toLowerCase()));
    }
    if (apiName) {
      tempOpenAndPrivateApis = tempOpenAndPrivateApis.filter(openAndPrivateApi => openAndPrivateApi.apiName.toLowerCase().includes(apiName.toLowerCase()));
    }

    return tempOpenAndPrivateApis;

  }

  findOpenAndPrivateApiById(openAndPrivateApis: OpenAndPrivateApi[], id: string) {
    return openAndPrivateApis.find(openAndPrivateApi => openAndPrivateApi.id === id);
  }

  deleteOpenAndPrivateApiById(id: string) {
    this.sharedStoreService.setLoading(true);
    let params = new HttpParams();
    params = params.append('id', id);
    this.httpClientService.delete(API_TREE_URIS.DELETE_API, params).subscribe({
      next: (data) => {
        this.sharedStoreService.setLoading(false);
        if (get(data, 'status') === "success") {
          this.msg.success('Open API deleted successfully.');
          this.sharedStoreService.setOpenAndPrivateApiUpdateResultFlag(true);
        } else {
          this.msg.error('Open API deleted failed');
        }
      },
      error: (error) => {
        this.sharedStoreService.setLoading(false);
        if (get(error, 'error.message')) {
          this.msg.error(get(error, 'error.message'));
        } else {
          this.msg.error('Open API deleted failed');
        }
      },
      complete: () => {}
    });
  }

  updateSubIdsOfOpenAndPrivateApi(id: string, subIds: string[]) {
    this.sharedStoreService.setLoading(true);
    let params = new HttpParams();
    params = params.append('id', id);
    params = params.append('subIds', JSON.stringify(subIds));
    this.httpClientService.put(API_TREE_URIS.UPDATE_SUB_API_IDS, params).subscribe({
      next: (data) => {
        this.sharedStoreService.setLoading(false);
        if (get(data, 'status') === "success") {
          this.msg.success('Sub APIs updated successfully.');
          this.sharedStoreService.setOpenAndPrivateApiUpdateResultFlag(true);
        } else {
          this.msg.error('Sub APIs updated failed');
        }
      },
      error: (error) => {
        this.sharedStoreService.setLoading(false);
        if (get(error, 'error.message')) {
          this.msg.error(get(error, 'error.message'));
        } else {
          this.msg.error('Sub APIs updated failed');
        }
      },
      complete: () => {}
    });
  }

  deleteSubApiById(id: string, subId: string) {
    this.sharedStoreService.setLoading(true);
    let params = new HttpParams();
    params = params.append('id', id);
    params = params.append('subId', subId);
    this.httpClientService.delete(API_TREE_URIS.DELETE_SUB_API, params).subscribe({
      next: (data) => {
        this.sharedStoreService.setLoading(false);
        if (get(data, 'status') === "success") {
          this.msg.success('Sub API deleted successfully.');
          this.sharedStoreService.setOpenAndPrivateApiUpdateResultFlag(true);
        } else {
          this.msg.error('Sub API deleted failed');
        }
      },
      error: (error) => {
        this.sharedStoreService.setLoading(false);
        if (get(error, 'error.message')) {
          this.msg.error(get(error, 'error.message'));
        } else {
          this.msg.error('Sub API deleted failed');
        }
      },
      complete: () => {}
    });
  }

  exportOpenAndPrivateApiToExcel(uri: string = '', uriSearchMode: string, httpMethod: string, classification: string, belongsToApplication: string, channel: string, swaggerTitle: string, apiName: string) {
    const params: { [key: string]: any } = {
        uri: uri,
        uriSearchMode: uriSearchMode,
        httpMethod: httpMethod,
        classification: classification,
        belongsToApplication: belongsToApplication,
        channel: channel,
        swaggerTitle: swaggerTitle,
        apiName: apiName
    }
    this.httpClientService.downloadFile(API_TREE_URIS.DOWNLOAD_APIS_EXCEL, API_TREE_SETTINGS.OPEN_PRIVATE_API_FILE_NAME, params);
  }

  getUiApiRelationData(uri: string, httpMethod: string) {
    let params = new HttpParams();
    params = params.append('uri', uri);
    params = params.append('httpMethod', httpMethod);
    let uiApiRelations: UiApiRelation[] = [];
    this.sharedStoreService.setLoading(true);
    this.httpClientService.get(UI_MARKER_URIS.UI_API_RELATION, params).subscribe({
      next: (data) => {
        this.sharedStoreService.setLoading(false);
        if (get(data, 'status') === "success") {
          uiApiRelations = get(data, 'formDetails', []) as UiApiRelation[]
          if (uiApiRelations.length > 0) {
            this.sharedStoreService.setUiApiRelationData(uiApiRelations);
          } else {
            this.msg.error('Cannot find any place using this API');
          }
        } else {
          this.msg.error('An error occurred while fetching UI API Relation data');
        }
      },
      error: (error) => {
        this.sharedStoreService.setLoading(false);
        this.msg.error('An error occurred while fetching UI API Relation data');
      },
      complete: () => {}
    });
  }
}
