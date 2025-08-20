import { Component } from '@angular/core';
import { FaviconService } from '../../services/common/favicon.service';
import { BaseComponent } from '../base/base.component';
import { Title } from '@angular/platform-browser';
import { MODULE_TITLES, API_TREE_SETTINGS } from '../../consts/sys-consts';

@Component({
  selector: 'app-api-tree',
  templateUrl: './api-tree.component.html',
  styleUrls: ['./api-tree.component.css']
})
export class ApiTreeComponent extends BaseComponent {

  private faviconPath: string = API_TREE_SETTINGS.FAVICON_PATH;

  constructor(
    private titleService: Title,
    private faviconService: FaviconService
  ) {
    super();
    
    //update the title and favicon for this module
    this.setTitle(MODULE_TITLES.API_TREE);
    this.faviconService.setFavicon(this.faviconPath);
  }

  ngOnInit() {
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

}
