import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UI_MARKER_URIS, API_RESP_MESSAGE } from '../../consts/sys-consts';
import { HttpClientService } from  '../common/http-client.service';
import { SharedStoreService } from '../common/shared-store.service';
import { CanvasToolService } from '../../services/common/canvas-tool.service';
import { get } from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PageListingEntity } from '../../types/ui-marker-type';
import { Observable, map } from 'rxjs';
import { Application } from '../../types/home-type';

@Injectable({
  providedIn: 'root'
})
export class UiMarkerService {

  constructor(
    private httpClientService: HttpClientService,
    private msg: NzMessageService,
    private canvasToolService: CanvasToolService,
    private sharedStoreService: SharedStoreService
  ) { }

  getApplications(): Observable<Application[]> {
    let applications: Application[] = [];
    return this.httpClientService.get(UI_MARKER_URIS.GET_APPLICATIONS).pipe(
      map(data => {
        applications = data as Application[];
        return applications;
      })
    )
  }

  getFunctionPages(applicationId: string, moduleId: string, functionId: string): void {
    let functionPages: PageListingEntity[] = [];
    // if applicationId, moduleId and functionId are not empty
    if (applicationId && moduleId && functionId) {
      this.sharedStoreService.setLoading(true);
      let params = new HttpParams();
      params = params.append('applicationId', applicationId).append('moduleId', moduleId).append('functionId', functionId);
      // get all the image file links from the server
      this.httpClientService.get(UI_MARKER_URIS.GET_PAGES, params).subscribe({
        next: (data) => {
          this.sharedStoreService.setLoading(false);
          // if data is not empty
          if (get(data, 'status') === "success") {
            functionPages = get(data, 'image_files', []) as PageListingEntity[];
            // sort the pages by functionPages.imageFileUri
            functionPages.sort((a, b) => a.imageFileUri.localeCompare(b.imageFileUri));
          } else {
            functionPages = [];
          }
        },
        error: (error) => {
          this.sharedStoreService.setLoading(false);
          functionPages = []
          console.error(error);
          this.msg.error(API_RESP_MESSAGE.SERVER_SIDE_ISSUE);
        },
        complete: () => {
          this.sharedStoreService.setFunctionPages(functionPages);
        }
      })
    } else {
      this.msg.error('Please select Application, Module and Function in the top drop-down menu');
    }
  }

  removePageImage(applicationId: string, moduleId: string, functionId: string, pageName: string) {
    // if applicationId, moduleId and functionId are not empty
    if (applicationId && moduleId && functionId) {
      this.sharedStoreService.setLoading(true);
      let params = new HttpParams();
      params = params.append('applicationId', applicationId).append('moduleId', moduleId).append('functionId', functionId).append('pageName', pageName);
      this.httpClientService.delete(UI_MARKER_URIS.REMOVE_PAGE, params).subscribe({
        next: (data) => {
          this.sharedStoreService.setLoading(false);
          if (get(data, 'status') === "success") {
            this.getFunctionPages(applicationId, moduleId, functionId);
            this.msg.success('Image deleted successfully');
          } else {
            this.msg.error('Image deletion failed');
          }
        },
        error: (error) => {
          this.sharedStoreService.setLoading(false);
          console.error(error);
          this.msg.error('Image deletion failed');
        },
        complete: () => {}
      });
    } else {
      this.msg.error('Please select Application, Module and Function in the top drop-down menu');
    }
  }

  saveMarkerDetails(applicationId: string, moduleId: string, functionId: string, pageName: string, rectJson: string) {
    // if applicationId, moduleId and functionId are not empty
    if (applicationId && moduleId && functionId && pageName && rectJson) {
      this.sharedStoreService.setLoading(true);
      let params = new HttpParams();
      params = params
        .append('applicationId', applicationId)
        .append('moduleId', moduleId)
        .append('functionId', functionId)
        .append('pageName', pageName)
        .append('canvasMarkerDetails', rectJson);
      this.httpClientService.post(UI_MARKER_URIS.CANVAS_MARKER_DETAILS, params).subscribe({
        next: (data) => {
          this.sharedStoreService.setLoading(false);
          if (get(data, 'status') === "success") {
            this.msg.success('UI Marker updated successfully.');
          } else {
            this.msg.error('UI Marker save failed');
          }
        },
        error: (error) => {
          this.sharedStoreService.setLoading(false);
          console.error(error);
          this.msg.error('UI Marker save failed');
        },
        complete: () => {}
      });
    } else {
      this.msg.error('The Application / Module / Function / Page Name / Marker details are empty, please mark the UI first.');
    }
  }

  removeMarkerDetails(applicationId: string, moduleId: string, functionId: string, pageName: string, rectId: string) {
    // if applicationId, moduleId and functionId are not empty
    if (applicationId && moduleId && functionId && pageName && rectId) {
      this.sharedStoreService.setLoading(true);
      let params = new HttpParams();
      params = params
        .append('applicationId', applicationId)
        .append('moduleId', moduleId)
        .append('functionId', functionId)
        .append('pageName', pageName)
        .append('rectId', rectId);
      this.httpClientService.delete(UI_MARKER_URIS.MARKER_FORM_DETAILS, params).subscribe({
        next: (data) => {
          this.sharedStoreService.setLoading(false);
          if (get(data, 'status') === "success") {
            this.msg.success('UI Marker deleted successfully.');
          } else {
            this.msg.error('UI Marker deletion failed');
          }
        },
        error: (error) => {
          this.sharedStoreService.setLoading(false);
          console.error(error);
          this.msg.error('UI Marker deletion failed');
        },
        complete: () => {}
      });
    } else {
      this.msg.error('Please select Application, Module, Function and Page Name in the top drop-down menu');
    }
  }

  removePageMarker(applicationId: string, moduleId: string, functionId: string, pageName: string) {
    // if applicationId, moduleId and functionId are not empty
    if (applicationId && moduleId && functionId && pageName) {
      this.sharedStoreService.setLoading(true);
      let params = new HttpParams();
      params = params
        .append('applicationId', applicationId)
        .append('moduleId', moduleId)
        .append('functionId', functionId)
        .append('pageName', pageName);
      this.httpClientService.delete(UI_MARKER_URIS.CANVAS_MARKER_DETAILS, params).subscribe({
        next: (data) => {
          this.sharedStoreService.setLoading(false);
          if (get(data, 'status') === "success") {
            this.msg.success('Page marker updated successfully.');
          } else {
            this.msg.error('Page marker updated failed');
          }
        },
        error: (error) => {
          this.sharedStoreService.setLoading(false);
          console.error(error);
          this.msg.error('Page marker updated failed');
        },
        complete: () => {}
      });
    } else {
      this.msg.error('Please select Application, Module, Function and Page Name in the top drop-down menu');
    }
  }

  saveElementFormDetails(applicationId: string, moduleId: string, functionId: string, pageName: string, rectId: string, formObj: string) {
    // if applicationId, moduleId and functionId are not empty
    if (applicationId && moduleId && functionId && pageName && rectId && formObj) {
      this.sharedStoreService.setLoading(true);
      let params = new HttpParams();
      params = params
        .append('applicationId', applicationId)
        .append('moduleId', moduleId)
        .append('functionId', functionId)
        .append('pageName', pageName)
        .append('rectId', rectId)
        .append('formObj', formObj);
      this.httpClientService.post(UI_MARKER_URIS.MARKER_FORM_DETAILS, params).subscribe({
        next: (data) => {
          this.sharedStoreService.setLoading(false);
          if (get(data, 'status') === "success") {
            this.msg.success('Your details are saved successfully.');
            this.sharedStoreService.setElementFormViewable(true);
          } else {
            this.msg.error('Your details are save failed');
          }
        },
        error: (error) => {
          this.sharedStoreService.setLoading(false);
          console.error(error);
          this.msg.error('Your details are save failed');
        },
        complete: () => {}
      });
    } else {
      this.msg.error('The Application / Module / Function / Page Name / Marker details are empty, please mark the UI first.');
    }
  }

  savePageFormDetails(applicationId: string, moduleId: string, functionId: string, pageName: string, formObj: string, refreshFlag?: boolean, pageViewTypeChangeFlag?: boolean) {
    // if applicationId, moduleId and functionId are not empty
    if (applicationId && moduleId && functionId && pageName && formObj) {
      this.sharedStoreService.setLoading(true);
      let params = new HttpParams();
      params = params
        .append('applicationId', applicationId)
        .append('moduleId', moduleId)
        .append('functionId', functionId)
        .append('pageName', pageName)
        .append('formObj', formObj);
      this.httpClientService.post(UI_MARKER_URIS.PAGE_FORM_DETAILS, params).subscribe({
        next: (data) => {
          this.sharedStoreService.setLoading(false);
          if (get(data, 'status') === "success") {
            this.msg.success('Page details are saved successfully.');
            this.sharedStoreService.setPageFormViewable(true);
            // update the pageViewTypeChangeFlag to share store for further refersh
            this.sharedStoreService.setDetailPageViewTypeChangeFlag(pageViewTypeChangeFlag || false);
            // when the flag is true, call listing api to refresh the title in list page
            if (refreshFlag) {
              this.getFunctionPages(applicationId, moduleId, functionId);
            }
          } else {
            this.msg.error('Page details are save failed');
          }
        },
        error: (error) => {
          this.sharedStoreService.setLoading(false);
          console.error(error);
          this.msg.error('Page details are save failed');
        },
        complete: () => {}
      });
    } else {
      this.msg.error('The Application / Module / Function / Page Name / Marker details are empty, please mark the UI first.');
    }
  }

  getElementFormDetails(applicationId: string, moduleId: string, functionId: string, pageName: string, rectId: string): void {
    // if applicationId, moduleId, functionId and pageName are not empty
    if (applicationId && moduleId && functionId && pageName && rectId) {
      this.sharedStoreService.setLoading(true);
      let params = new HttpParams();
      params = params
        .append('applicationId', applicationId)
        .append('moduleId', moduleId)
        .append('functionId', functionId)
        .append('pageName', pageName)
        .append('rectId', rectId);
      this.httpClientService.get(UI_MARKER_URIS.MARKER_FORM_DETAILS, params).subscribe({
        next: (data) => {
          this.sharedStoreService.setLoading(false);
          if (get(data, 'status') === "success") {
            const formDetails = get(data, 'formDetails', '') as string;
            this.sharedStoreService.setElementFormDetails(formDetails);
          }
        },
        error: (error) => {
          this.sharedStoreService.setLoading(false);
          console.error(error);
          this.msg.error(API_RESP_MESSAGE.SERVER_SIDE_ISSUE);
        },
        complete: () => {}
      });
    } else {
      this.msg.error('Please select Application, Module, Function, Page Name at the top drop-down menu, and select a Marker');
    }
  }

  getPageFormDetails(applicationId: string, moduleId: string, functionId: string, pageName: string) {
    // if applicationId, moduleId, functionId and pageName are not empty
    if (applicationId && moduleId && functionId && pageName) {
      this.sharedStoreService.setLoading(true);
      let params = new HttpParams();
      params = params
        .append('applicationId', applicationId)
        .append('moduleId', moduleId)
        .append('functionId', functionId)
        .append('pageName', pageName);
      this.httpClientService.get(UI_MARKER_URIS.PAGE_FORM_DETAILS, params).subscribe({
        next: (data) => {
          this.sharedStoreService.setLoading(false);
          if (get(data, 'status') === "success") {
            const formDetails = get(data, 'formDetails', '') as string;
            this.sharedStoreService.setPageFormDetails(formDetails);
          }
        },
        error: (error) => {
          this.sharedStoreService.setLoading(false);
          console.error(error);
          this.msg.error(API_RESP_MESSAGE.SERVER_SIDE_ISSUE);
        },
        complete: () => {}
      });
    } else {
      this.msg.error('Please select Application, Module, Function and Page Name in the top drop-down menu');
    }
  }

  getMarkerDetails(applicationId: string, moduleId: string, functionId: string, pageName: string) {
    let markerDetails: string = '';
    // if applicationId, moduleId, functionId and pageName are not empty
    if (applicationId && moduleId && functionId && pageName) {
      this.sharedStoreService.setLoading(true);
      let params = new HttpParams();
      params = params
        .append('applicationId', applicationId)
        .append('moduleId', moduleId)
        .append('functionId', functionId)
        .append('pageName', pageName);
      this.httpClientService.get(UI_MARKER_URIS.CANVAS_MARKER_DETAILS, params).subscribe({
        next: (data) => {
          this.sharedStoreService.setLoading(false);
          if (get(data, 'status') === "success") {
            markerDetails = get(data, 'canvasMarkerDetails', '') as string;
            this.canvasToolService.loadMarkerDetails(markerDetails);
            // this.sharedStoreService.setCanvasMarkerDetails(markerDetails);
          }
        },
        error: (error) => {
          this.sharedStoreService.setLoading(false);
          console.error(error);
          this.msg.error(API_RESP_MESSAGE.SERVER_SIDE_ISSUE);
        },
        complete: () => {
        }
      });
    } else {
      this.msg.error('Please select Application, Module, Function and Page Name in the top drop-down menu');
    }
  }
}
