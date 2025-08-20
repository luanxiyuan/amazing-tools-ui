import { Injectable } from '@angular/core';
import { Abbreviation } from '../../types/abbreviation-type';
import { SharedStoreService } from '../common/shared-store.service';
import { HttpClientService } from '../common/http-client.service';
import { ABBREVIATION_URIS } from '../../consts/sys-consts';
import { catchError, map } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpParams } from '@angular/common/http';
import { get } from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class AbbrevationService {

  constructor(
    private httpClientService: HttpClientService,
    private sharedStoreService: SharedStoreService,
    private msg: NzMessageService
  ) { }

  getAbbreviations() {
    let abbreviation: Abbreviation[] = [];
    this.sharedStoreService.setLoading(true);
    return this.httpClientService.get(ABBREVIATION_URIS.ABBREVIATIONS).pipe(
      map(data => {
        this.sharedStoreService.setLoading(false);
        abbreviation = data as Abbreviation[];
        return abbreviation;
      }),
      catchError(error => {
        this.sharedStoreService.setLoading(false);
        console.error('An error occurred in getAbbreviations:', error);
        return [];
      })
    )
  }

  updateAbbreviations(abbreviations: Abbreviation[]) {
    this.sharedStoreService.setLoading(true);
    let params = new HttpParams();
    params = params.append('abbreviations', JSON.stringify(abbreviations));
    return this.httpClientService.post(ABBREVIATION_URIS.ABBREVIATIONS, params).subscribe({
      next: (data) => {
        this.sharedStoreService.setLoading(false);
        if (get(data, 'status') === "success") {
          this.msg.success('Abbreviations updated successfully.');
          this.sharedStoreService.setAbbreviationResultFlag(true);
        } else {
          this.msg.error('Abbreviations updated failed');
        }
      },
      error: (error) => {
        this.sharedStoreService.setLoading(false);
        console.error('An error occurred in updateAbbreviations:', error);
        return [];
      },
      complete: () => { }
    });
  }
}
