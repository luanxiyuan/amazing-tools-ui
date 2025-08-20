import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MODULE_TITLES, ABBREVIATION_SETTINGS } from '../../consts/sys-consts';
import { SharedStoreService } from '../../services/common/shared-store.service';
import { FaviconService } from '../../services/common/favicon.service';

@Component({
  selector: 'app-abbreviation',
  templateUrl: './abbreviation.component.html',
  styleUrls: ['./abbreviation.component.css']
})
export class AbbreviationComponent {

  totalCount: number = 0;
  private faviconPath: string = ABBREVIATION_SETTINGS.FAVICON_PATH;

  constructor(
    private titleService: Title,
    private sharedStoreService: SharedStoreService,
    private faviconService: FaviconService
  ) {
    // set the module title
    this.setTitle(MODULE_TITLES.ABBREVIATION);
    this.faviconService.setFavicon(this.faviconPath);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    // subscribe the abbreviation total count from shared store
    this.sharedStoreService.getAbbreviationTotalCount().subscribe(count => {
      this.totalCount = count;
    });
  }

}
