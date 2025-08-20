import { Injectable } from '@angular/core';
import { HttpClientService } from '../common/http-client.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SharedStoreService } from '../common/shared-store.service';
import { HttpParams } from '@angular/common/http';
import { BB_CONTRIBUTION_SETTINGS, BB_CONTRIBUTION_URIS } from '../../consts/sys-consts';
import { catchError, map } from 'rxjs';
import { CommitRecord } from '../../types/bb-contribution';
import { get } from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class BbContributionService {

  constructor(
    private httpClientService: HttpClientService,
    private sharedStoreService: SharedStoreService,
    private msg: NzMessageService) { 
  }

  getCommitList(soeids: string[], startDate: string, endDate: string, onlyDefaultBranch: boolean = false) {
    let commitRecords : CommitRecord[] = [];
    this.sharedStoreService.setLoading(true);
    let params = new HttpParams();
    params = params.set('soeids', soeids.join(','));
    params = params.set('start_date', startDate ? startDate : '');
    params = params.set('end_date', endDate ? endDate : '');
    params = params.set('only_default_branch', onlyDefaultBranch ? 'true' : 'false');
    return this.httpClientService.get(BB_CONTRIBUTION_URIS.GET_COMMIT_LIST, params).pipe(
      map(data => {
        this.sharedStoreService.setLoading(false);
        commitRecords = data as CommitRecord[];
        if (commitRecords.length === 0) {
          this.msg.error('No commit records found');
        }
        return commitRecords;
      }),
      catchError(error => {
        this.sharedStoreService.setLoading(false);
        this.msg.error('An error occurred while fetching Commit List');
        return [];
      })
    )
  }

  exportCommitsToExcel(soeids: string[], startDate: string, endDate: string, onlyDefaultBranch: boolean = false) {
    const params: { [key: string]: any } = {
      soeids: soeids.join(','),
      start_date: startDate,
      end_date: endDate,
      only_default_branch: onlyDefaultBranch
    }
    this.httpClientService.downloadFile(BB_CONTRIBUTION_URIS.DOWNLOAD_COMMIT_EXCEL, BB_CONTRIBUTION_SETTINGS.COMMIT_RECORDS_EXCEL_FILE_NAME, params);
  }

  refreshCommits() {
    this.sharedStoreService.setLoading(true);
    return this.httpClientService.get(BB_CONTRIBUTION_URIS.REFRESH_COMMIT_LIST).pipe(
      map(data => {
        this.sharedStoreService.setLoading(false);
        if (get(data, 'status') === 'success') {
          this.msg.success('Commit List is refreshing, please check about 10 minutes later');
        }
        return data;
      }),
      catchError(error => {
        this.sharedStoreService.setLoading(false);
        this.msg.error('An error occurred while refreshing Commit List');
        return [];
      })
    )
  }

  // get last time refresh info
  getLastRefreshInfo() {
    return this.httpClientService.get(BB_CONTRIBUTION_URIS.GET_REFRESH_INFO).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return [];
      })
    )
  }

  // get last time refresh repo list
  getLastRefreshRepoList() {
    return this.httpClientService.get(BB_CONTRIBUTION_URIS.GET_REPO_LINKS).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return [];
      })
    )
  }
}
