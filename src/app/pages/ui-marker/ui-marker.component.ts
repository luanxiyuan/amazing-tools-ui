import { AfterViewInit, Component } from '@angular/core';
import { Application, Module, Function } from '../../types/home-type'
import { ActivatedRoute } from '@angular/router';
import { SharedStoreService } from '../../services/common/shared-store.service';
import { BaseComponent } from '../base/base.component';
import { takeUntil } from 'rxjs';
import { UiMarkerService } from '../../services/ui-marker/ui-marker.service';
import { Title } from '@angular/platform-browser';
import { MODULE_TITLES, APPLICATIONS_BY_MARKET, APPLICATIONS_BY_REGION, UI_MARKER_SETTINGS } from '../../consts/sys-consts';
import { FaviconService } from '../../services/common/favicon.service';
import { UrlToolService } from '../../services/common/url-tool.service';

@Component({
  selector: 'app-ui-marker',
  templateUrl: './ui-marker.component.html',
  styleUrls: ['./ui-marker.component.css']
})
export class UiMarkerComponent extends BaseComponent implements AfterViewInit {

  constructor(
    private route: ActivatedRoute,
    private sharedStoreService: SharedStoreService,
    private uiMarkerService: UiMarkerService,
    private titleService: Title,
    private faviconService: FaviconService,
    private urlToolService: UrlToolService
  ) {
    super();

    //update the title and favicon for this module
    this.setTitle(MODULE_TITLES.UI_MARKER);
    this.faviconService.setFavicon(this.faviconPath);
  }

  public applications: Application[] = [];
  // set selectedApplication value as request param applicationId
  public selectedApplicationId: string = '';
  public modules: Module[] | undefined = [];
  public selectedModuleId: string = '';
  public functions: Function[] | undefined = [];
  public selectedFunctionId: string = '';
  private faviconPath: string = UI_MARKER_SETTINGS.FAVICON_PATH;

  public applicationSelectStatus: 'error' | 'warning' | '' = '';
  public moduleSelectStatus: 'error' | 'warning' | '' = '';
  public functionSelectStatus: 'error' | 'warning' | '' = '';
  pageListUri = UI_MARKER_SETTINGS.PAGE_LIST_URI;

  ngOnInit() {
    this.sharedStoreService.getSelectedApplicationId()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((id) => {
        this.selectedApplicationId = id;
        if (!this.selectedApplicationId) {
          this.applicationSelectStatus = 'error';
        } else {
          this.applicationSelectStatus = '';
        }
      });

    this.sharedStoreService.getSelectedModuleId()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((id) => {
        this.selectedModuleId = id;
        if (!this.selectedModuleId) {
          this.moduleSelectStatus = 'error';
        } else {
          this.moduleSelectStatus = '';
        }
      });

    this.sharedStoreService.getSelectedFunctionId()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((id) => {
        this.selectedFunctionId = id;
        if (!this.selectedFunctionId) {
          this.functionSelectStatus = 'error';
        } else {
          this.functionSelectStatus = '';
        }
      });

    // initiate the top dropdown at the top
    this.initiateTopDropdown();
  }

  ngAfterViewInit() {
    // get the query params from the URL, then update to shared store for subscription
    this.route.queryParams.subscribe(params => {
      this.selectedApplicationId = params['applicationId'] || '';
      if (this.selectedApplicationId) {
        this.sharedStoreService.setSelectedApplicationId(this.selectedApplicationId);
        this.setApplicationScopeType();
      }

      this.selectedModuleId = params['moduleId'] || '';
      if (this.selectedModuleId) {
        this.sharedStoreService.setSelectedModuleId(this.selectedModuleId);
      }

      this.selectedFunctionId = params['functionId'] || '';
      if (this.selectedFunctionId) {
        this.sharedStoreService.setSelectedFunctionId(this.selectedFunctionId);
      }
    });
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  initiateTopDropdown() {
    this.uiMarkerService.getApplications().subscribe((data) => {
      this.applications = data;
      // if this.applications is not empty and this.selectedApplication is not empty
      if (this.applications.length > 0 && this.selectedApplicationId) {
        // find the modules under the application which id == this.selectedApplication
        this.setModulesByApplicationId(this.selectedApplicationId);

        // if this.modules is not empty and this.selectedModule is not empty
        if (this.modules && this.modules.length > 0 && this.selectedModuleId) {
          // find the functions under the module which id == this.selectedModule
          this.setFunctionsByModuleId(this.selectedModuleId);
          
          // if this.functions is not empty and this.selectedFunction is not empty
          if (this.functions && this.functions.length > 0 && this.selectedFunctionId) {
            // find the pages under the function which id == this.selectedFunction
            this.uiMarkerService.getFunctionPages(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId);
          }
        }
      }
    });
  }

  setApplicationScopeType() {
    // if this.selectedApplicationId is in APPLICATIONS_BY_MARKET, set the applicationScopeType to UI_MARKER_SETTINGS.APPLICATION_SCOPE_TYPE_MARKET
    // if this.selectedApplicationId is in APPLICATIONS_BY_REGION, set the applicationScopeType to UI_MARKER_SETTINGS.APPLICATION_SCOPE_TYPE_REGION
    if (APPLICATIONS_BY_MARKET.includes(this.selectedApplicationId)) {
      this.sharedStoreService.setApplicationScopeType(UI_MARKER_SETTINGS.APPLICATION_SCOPE_TYPE_MARKET);
    } else if (APPLICATIONS_BY_REGION.includes(this.selectedApplicationId)) {
      this.sharedStoreService.setApplicationScopeType(UI_MARKER_SETTINGS.APPLICATION_SCOPE_TYPE_REGION);
    } else {
      this.sharedStoreService.setApplicationScopeType('');
    }
  }

  applicationChange(value: string) {
    // if value is not empty
    if (value) {
      this.clearModules();
      this.clearFunctions();
      this.selectedApplicationId = value;
      this.selectedModuleId = '';
      this.selectedFunctionId = '';
      this.setModulesByApplicationId(value);

      const queryParams = { 
        applicationId: this.selectedApplicationId
      }
      this.urlToolService.navigateTo(`${this.pageListUri}`, queryParams);
    }
  }

  moduleChange(value: string) {
    // if value is not empty
    if (value) {
      this.clearFunctions();
      this.selectedModuleId = value;
      this.selectedFunctionId = '';
      this.setFunctionsByModuleId(value);

      const queryParams = { 
        applicationId: this.selectedApplicationId,
        moduleId: this.selectedModuleId
      }
      this.urlToolService.navigateTo(`${this.pageListUri}`, queryParams);
    }
  }

  functionChange(value: string) {
    // if value is not empty
    if (value) {
      this.selectedFunctionId = value;

      this.uiMarkerService.getFunctionPages(this.selectedApplicationId, this.selectedModuleId, this.selectedFunctionId);

      const queryParams = { 
        applicationId: this.selectedApplicationId,
        moduleId: this.selectedModuleId,
        functionId: this.selectedFunctionId
      }
      this.urlToolService.navigateTo(`${this.pageListUri}`, queryParams);
    }
  }

  setModulesByApplicationId(applicationId: string): void {
    const selectedApp = this.applications.find(app => app.id == applicationId);
    if (selectedApp) {
      this.modules = selectedApp.modules || [];
      // sort by module.name
      this.modules.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  setFunctionsByModuleId(moduleId: string): void {
    const selectedModule = this.modules!.find(mod => mod.id == moduleId);
    if (selectedModule) {
      this.functions = selectedModule.functions || [];
      // sort by function.name
      this.functions.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  clearModules() {
    // clear modules and selectedModule
    this.modules = [];
    this.selectedModuleId = '';
  }

  clearFunctions() {
    // clear functions and selectedFunction
    this.functions = [];
    this.selectedFunctionId = '';
  }

}
