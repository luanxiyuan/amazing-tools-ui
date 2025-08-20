import { Injectable } from '@angular/core';

import { HttpClientService } from '../common/http-client.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SharedStoreService } from '../common/shared-store.service';
import { catchError, map, Observable } from 'rxjs';
import { COMMON_URIS, ONE_STEP_URIS } from '../../consts/sys-consts';
import { CommandSet } from '../../types/one-step-type';
import { HttpParams } from '@angular/common/http';
import { get } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class OneStepService {

  constructor(
    private httpClientService: HttpClientService,
    private msg: NzMessageService,
    private sharedStoreService: SharedStoreService
  ) { }

  getCommandSets(): Observable<CommandSet[]> {
    let CommandSets: CommandSet[] = [];
    this.sharedStoreService.setLoading(true);
    return this.httpClientService.get(ONE_STEP_URIS.GET_COMMAND_SETS).pipe(
      map(data => {
        this.sharedStoreService.setLoading(false);
        CommandSets = data as CommandSet[];
        return CommandSets;
      }),
      catchError(error => {
        this.sharedStoreService.setLoading(false);
        this.msg.error('Failed to fetch command sets');
        return [];
      })
    )
  }

  executeCommandSet(commandSet: CommandSet) {
    // execute the commandSet
    const commandSetStr = JSON.stringify(commandSet);
    let params = new HttpParams();
    params = params.append('command_set', commandSetStr);
    this.httpClientService.post(ONE_STEP_URIS.EXECUTE_COMMAND_SET, params).subscribe({
      next: (data) => {
        if (get(data, 'status') === "failed") {
          this.msg.error('Command execution failed');
        } else {
          this.msg.success('Command execution started.');
        }
      },
      error: (error) => {
        console.error(error);
        this.msg.error('Command execution has some error');
      },
      complete: () => {}
    });
  }

  stopProcess(commandSet: CommandSet) {
    // stop the process
    const commandSetStr = JSON.stringify(commandSet);
    let params = new HttpParams();
    params = params.append('command_set', commandSetStr);
    this.httpClientService.post(ONE_STEP_URIS.STOP_PROCESS, params).subscribe({
      next: (data) => {
        if (get(data, 'status') === "failed") {
          this.msg.error('Stop process command failed');
        } else {
          this.msg.success('Stop process command requeted.');
        }
      },
      error: (error) => {
        console.error(error);
        this.msg.error('Command execution has some error');
      },
      complete: () => {}
    });
  }

  viewExecutionLog(commandSet: CommandSet): Observable<string> {
    // view the execution log
    const commandSetStr = JSON.stringify(commandSet);
    let params = new HttpParams();
    params = params.append('command_set', commandSetStr);
    return this.httpClientService.get(ONE_STEP_URIS.VIEW_EXECUTION_LOG, params).pipe(
      map(data => {
        let execLog = "";
        if (get(data, 'status') === "success") {
          execLog = get(data, 'logContent', '');
        } else {
          this.msg.error('Internal Server Error.');
        }
        return execLog;
      }),
      catchError(error => {
        this.msg.error('Internal Server Error');
        return '';
      })
    );
  }

  getBackendOSType(): Observable<string> {
    return this.httpClientService.get(COMMON_URIS.BACKEND_OS_TYPE).pipe(
      map(data => {
        return get(data, 'osType', '');
      }),
      catchError(error => {
        this.msg.error('Internal Server Error');
        return '';
      })
    );
  }
}
