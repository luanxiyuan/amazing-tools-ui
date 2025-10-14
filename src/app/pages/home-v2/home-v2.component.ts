import { Component } from '@angular/core';
import { FileToolService } from '../../services/common/file-tool.service'
import { CommunicationToolService } from '../../services/common/communication-tool.service';
import { AppCategory } from '../../types/home-type';
import { ADMIN_ID } from '../../consts/sys-consts';
import { UrlToolService } from '../../services/common/url-tool.service';

@Component({
  selector: 'app-home-v2',
  templateUrl: './home-v2.component.html',
  styleUrls: ['./home-v2.component.css']
})
export class HomeV2Component {

  // constructor
  constructor(
    private communicationToolService: CommunicationToolService,
    private fileToolService: FileToolService,
    private urlToolService: UrlToolService
  ) { }

  appCategories: AppCategory[] = [];

  ngOnInit(): void {
    this.fileToolService.loadGlobalConfigFile().subscribe((data: any) => {
      this.appCategories = data['categories'] || [];
      // loop this.appCategories, and get the apps from each category, then filter out the apps that are not eligible
      this.appCategories.forEach((category: AppCategory) => {
        if (category.apps) {
          category.apps = category.apps.filter((app: any) => app.eligible);
        }
      });
    });
  }

  linkout(url: string): void {
    // if url is empty, do nothing
    if (!url) {
      return;
    }

    // if url starts with http or https, open a new tab
    if (url.startsWith('http://') || url.startsWith('https://')) {
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
    this.communicationToolService.openTeamsWindow(ADMIN_ID);
  }

}
