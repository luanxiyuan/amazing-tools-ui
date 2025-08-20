import { Injectable } from '@angular/core';
import { UrlToolService } from './url-tool.service';

@Injectable({
  providedIn: 'root'
})
export class CommunicationToolService {

  constructor(
    private urlToolService: UrlToolService
  ) { }

  openTeamsWindow(soeIds: string | string[]) {
    let soeIdAccounts = '';
    if (Array.isArray(soeIds)) {
      // append '@company.com' after each soeId, and connect them with ','
      soeIdAccounts = soeIds.map(soeId => 
        `${soeId.trim()}@company.com`
      ).join(',');
    } else {
      soeIdAccounts = `${soeIds}@company.com`;
    }
    this.urlToolService.linkToOtherSite(`https://teams.microsoft.com/l/chat/0/0?users=${soeIdAccounts}`, true, 4000);
  }

  openMailBox(soeIds: string | string[], name?: string) {
    let soeIdAccounts = '';
    let mailName = name;
    if (Array.isArray(soeIds)) {
      // append '@company.com' after each soeId, and connect them with ','
      soeIdAccounts = soeIds.map(soeId => 
        `${soeId.trim()}@company.com`
      ).join(',');
    } else {
      soeIdAccounts = `${soeIds}@company.com`;
      mailName = name?.replace(/[0-9]/g, '') as string; // Remove numbers
      mailName = mailName?.replace(/\[.*?\]/g, '')?.trim(); // Remove text within brackets, and leading/trailing spaces
    }
    const mailBody = mailName ? `Hi ${mailName},` : '';
    this.urlToolService.linkToOtherSite(`mailto:${soeIdAccounts}?body=${mailBody}`, true, 1000);
  }
}
