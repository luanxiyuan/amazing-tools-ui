import { Component } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { BB_CONTRIBUTION_SETTINGS, MODULE_TITLES } from '../../consts/sys-consts';
import { Title } from '@angular/platform-browser';
import { FaviconService } from '../../services/common/favicon.service';

@Component({
  selector: 'app-bb-contribution',
  templateUrl: './bb-contribution.component.html',
  styleUrls: ['./bb-contribution.component.css']
})
export class BbContributionComponent extends BaseComponent {

  private faviconPath: string = BB_CONTRIBUTION_SETTINGS.FAVICON_PATH;

  constructor(
    private titleService: Title,
    private faviconService: FaviconService
  ) {
    super();
    
    //update the title and favicon for this module
    this.setTitle(MODULE_TITLES.BB_CONTRIBUTION);
    this.faviconService.setFavicon(this.faviconPath);
  }

  ngOnInit() {
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

}
