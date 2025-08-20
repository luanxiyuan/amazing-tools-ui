import { Component } from '@angular/core';

import { MODULE_TITLES, ONE_STEP_SETTINGS } from '../../consts/sys-consts';
import { Title } from '@angular/platform-browser';
import { FaviconService } from '../../services/common/favicon.service';
import { OneStepService } from '../../services/one-step/one-step.service';
import { StringToolService } from '../../services/common/string-tool.service';
import { CommandSet } from '../../types/one-step-type';
import { get } from 'lodash';

@Component({
  selector: 'app-one-step',
  templateUrl: './one-step.component.html',
  styleUrls: ['./one-step.component.css']
})
export class OneStepComponent {
  commandSets: CommandSet[] = [];
  displayCommandSets: CommandSet[] = [];
  execLog: string = '';
  isExecLogPopupVisible = false;
  intervalInstance: any;

  constructor(
    private oneStepSerice: OneStepService,
    private titleService: Title,
    private faviconService: FaviconService,
    private stringToolService: StringToolService
  ) {
    // set the module title
    this.setTitle(MODULE_TITLES.ONE_STEP);
    this.faviconService.setFavicon(this.faviconPath);
  }

  private faviconPath: string = ONE_STEP_SETTINGS.FAVICON_PATH;

  public osTypeOptions = [
    { label: 'MacOS', value: 'MacOS', icon: 'apple' },
    { label: 'Windows', value: 'Windows', icon: 'windows' }
  ];
  currentOsType: number = 0;    // the index of osType in osTypeOptions
  backendOsType: number = -1;   // the index of osType in osTypeOptions

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.getCurrentOsType();
  }

  getCurrentOsType() {
    this.oneStepSerice.getBackendOSType().subscribe((data: string) => {
      if (data) {
        const osTypeIndex = this.osTypeOptions.findIndex(osType => osType.value === data);
        this.backendOsType = osTypeIndex;
        this.currentOsType = osTypeIndex;
      }
      this.fetchAllCommandSets();
    });
  }

  fetchAllCommandSets(): void {
    this.oneStepSerice.getCommandSets().subscribe((data: any) => {
      this.commandSets = data;
      this.filterByOsType();
    });
  }

  filterByOsType() {
    this.displayCommandSets = this.commandSets.filter(commandSet => {
      return commandSet.osType === this.osTypeOptions[this.currentOsType].value;
    })
  }

  copyString(soeId: string) {
    this.stringToolService.copyToClipboard(soeId);
  }

  executeCommandSet(commandSet: CommandSet) {
    // if commandSet has ports, then view execution log, use lodash get
    if (get(commandSet, 'ports', []).length > 0) {
      this.viewExecutionLog(commandSet);
    }

    this.oneStepSerice.executeCommandSet(commandSet);
  }

  stopProcess(commandSet: CommandSet) {
    this.oneStepSerice.stopProcess(commandSet);

    // reload after 4 seconds
    const reloadAfterStopMs = ONE_STEP_SETTINGS.RELOAD_AFTER_STEP_MS;
    setTimeout(() => {
      this.fetchAllCommandSets();
    }, reloadAfterStopMs);
  }

  viewExecutionLog(commandSet: CommandSet) {
    this.execLog = 'Fetching the execution log...';
    this.openExecLogModal();
    
    const intervalInMs = ONE_STEP_SETTINGS.EXECUTE_LOG_FETCH_INTERVAL_MS;
    // trigger the this.oneStepSerice.viewExecutionLog every 3 seconds to get the latest log
    this.intervalInstance = setInterval(() => {
      this.oneStepSerice.viewExecutionLog(commandSet).subscribe((data: any) => {
        this.execLog = data;
        // auto scroll div with class 'ant-modal-body' section to bottom
        setTimeout(() => {
          const modalBody = document.querySelector('.ant-modal-body');
          if (modalBody) {
            // scroll smoothly
            modalBody.scrollTo({ top: modalBody.scrollHeight, behavior: 'smooth' });
          }
        }, 200);
      });
    }, intervalInMs);
  }

  reloadPortStatus() {
    this.fetchAllCommandSets();
  }

  openExecLogModal(): void {
    this.isExecLogPopupVisible = true;
  }

  closeExecLogPopup(): void {
    // close this.intervalInstance
    clearInterval(this.intervalInstance);
    this.isExecLogPopupVisible = false;
    // reload the command details
    this.fetchAllCommandSets();
  }

}
