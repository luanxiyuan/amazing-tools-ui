import { Component } from '@angular/core';
import { FileToolService } from '../../services/common/file-tool.service'
import { CommunicationToolService } from '../../services/common/communication-tool.service';
import { AppCategory, ToolApps } from '../../types/home-type';
import { ADMIN_SOEID } from '../../consts/sys-consts';
import { UrlToolService } from '../../services/common/url-tool.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  // constructor
  constructor(
    private communicationToolService: CommunicationToolService,
    private fileToolService: FileToolService,
    private urlToolService: UrlToolService
  ) { }

  // variables
  public toolApps: ToolApps[] = [];
  appCategories: AppCategory[] = [];

  // functions
  ngOnInit(): void {
    this.fileToolService.loadGlobalConfigFile().subscribe((data: any) => {
      this.appCategories = data['categories'] || [];
      // filter eligible apps
      this.appCategories.forEach((category: AppCategory) => {
        if (category.apps) {
          category.apps = category.apps.filter((app: ToolApps) => app.eligible);
        }
      });
      // get all the apps under each category, and flat them into this.toolApps
      this.toolApps = this.appCategories.reduce((acc: ToolApps[], category: AppCategory) => {
        return acc.concat(category.apps || []);
      }, []);
    });
  }

  goToAppLandingPage(url: string): void {
    // if url is not empty, and url starts with http or https
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      this.urlToolService.linkToOtherSite(url);
    } else if (url.startsWith('<html>')) {
      const htmlContent = url;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      url = URL.createObjectURL(blob);
      this.urlToolService.linkToOtherSite(url);
    } else {
      // router to open the url
      this.urlToolService.navigateTo(url, {});
    }
  }

  openTeamsWindow() {
    this.communicationToolService.openTeamsWindow(ADMIN_SOEID);
  }
  
}
