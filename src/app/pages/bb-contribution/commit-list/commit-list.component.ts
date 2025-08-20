import { Component } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BbContributionService } from '../../../services/bb-contribution/bb-contribution.service';
import { CommitRecord, RepoInfo, TableFilterOption } from '../../../types/bb-contribution';
import { ADMIN_SOEID, BB_CONTRIBUTION_SETTINGS } from '../../../consts/sys-consts';
import { UrlToolService } from '../../../services/common/url-tool.service';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep, get } from 'lodash-es';
import { CommunicationToolService } from '../../../services/common/communication-tool.service';

@Component({
  selector: 'app-commit-list',
  templateUrl: './commit-list.component.html',
  styleUrls: ['./commit-list.component.css']
})
export class CommitListComponent extends BaseComponent {

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private urlToolService: UrlToolService,
    private route: ActivatedRoute,
    private communicationToolService: CommunicationToolService,
    private bbContributionService: BbContributionService
  ) {
    super();
  }

  datePeriodRanges = {
    'Today': this.getStartAndEndDate(1), 
    'Last 7 Days': this.getStartAndEndDate(7),
    'Last 30 Days': this.getStartAndEndDate(30),
    'Last 90 Days': this.getStartAndEndDate(90),
  };

  commitRecords: CommitRecord[] = [];
  cachedAllCommitRecords: CommitRecord[] = []; // this is to catch all the commit record each time when we get the latest code from API, which is used for client side filtering
  tempFilteredCommitRecords: CommitRecord[] = [];  // this is to store the filtered commit records when user click the filter button, as there're multiple filters
  badgeOverflowCount: number = BB_CONTRIBUTION_SETTINGS.BADGE_OVERFLOW_COUNT;
  lastRefreshTime: string = '';
  isAllowedToRefresh: boolean = false;
  lastRefreshRepos: RepoInfo[] = [];
  isInstructionPopupVisible: boolean = false;
  durationByDays: number = 0;
  branchPageSize: number = 0;
  allowedRefreshIntervalInMinute: number = 0;

  branchFilterValues: TableFilterOption[] = [];
  currentFilteredBranches: string[] = [];
  authorFilterValues: TableFilterOption[] = [];
  currentFilteredAuthors: string[] = [];
  repoFilterValues: TableFilterOption[] = [];
  currentFilteredRepos: string[] = [];

  ngOnInit() {
    // get the query param from url and patch them in searchForm
    // this is the the case when user refresh the page or directly access the page with query params
    this.getQueryParamFromUrl();

    // get the commit records from API
    this.onSearchCommits(true);
  }

  ngAfterViewInit() {
    // get last time refresh info
    this.getLastRefreshInfo();
    // get last refresh repo list
    this.getLastRefreshRepoList();
  }

  getLastRefreshInfo() {
    this.bbContributionService.getLastRefreshInfo().subscribe((data: any) => {
      if (data.status === 'success') {
        // date is as format {
        //     "last_refresh_time": "",
        //     "is_allowed_to_refresh": is_allowed,
        //     "duration_by_days": 90,
        //     "branch_page_size": 90,
        //     "allowed_refresh_interval_in_minute": 90,
        // }
        this.lastRefreshTime = get(data, 'result.last_refresh_time', '');
        this.isAllowedToRefresh = get(data, 'result.is_allowed_to_refresh', false);
        this.durationByDays = get(data, 'result.duration_by_days', 90);
        this.branchPageSize = get(data, 'result.branch_page_size', 10);
        this.allowedRefreshIntervalInMinute = get(data, 'result.allowed_refresh_interval_in_minute', 30);
      }
    });
  }

  getLastRefreshRepoList() {
    this.bbContributionService.getLastRefreshRepoList().subscribe((data: any) => {
      if (data.status === 'success') {
        const repoObject = get(data, 'result', {});
        this.lastRefreshRepos = this.flattenRepoObject(repoObject);
      } else {
        this.lastRefreshRepos = [];
      }
    });
  }

  flattenRepoObject(repoObject: { [key: string]: string[] }): RepoInfo[] {
    const flattenedArray: RepoInfo[] = [];
  
    for (const projectSpace in repoObject) {
      if (repoObject.hasOwnProperty(projectSpace)) {
        const repoLinks = repoObject[projectSpace];
        repoLinks.forEach(repoLink => {
          const repoNameMatch = repoLink.match(/repos\/([^\/]+)\/browse/);
          const repoName = repoNameMatch ? repoNameMatch[1] : '';
          flattenedArray.push({
            projectSpace,
            repoName,
            repoLink
          });
        });
      }
    }
  
    return flattenedArray;
  }

  // write a function with input param "lastDays", return an array of Date[] with the start and end date
  // for example, if lastDays = 7, return [new Date() + 1 day - 7 days, new Date() + 1 day]
  getStartAndEndDate(lastDays: number): Date[] {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1); // Add 1 day to the current date
  
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - lastDays); // Subtract lastDays from the end date
  
    return [startDate, endDate];
  }

  searchForm: FormGroup<{
    soeid: FormControl<string | null>;
    onlyDefaultBranch: FormControl<boolean | null>;
    datePeriod: FormControl<Date[] | null>;
  }> = this.fb.group({
    soeid: this.fb.control<string>(''),
    onlyDefaultBranch: this.fb.control<boolean>(false),
    datePeriod: this.fb.control<Date[] | null>(null)
  });

  clearInputSoeid() {
    this.searchForm.get('soeid')?.setValue(null);
  }

  onSearchCommits(isFirstTime: boolean = false) {
    let soeid = this.searchForm.get('soeid')?.value || '';

    if (isFirstTime && !soeid) {
      return;
    }

    if (!this.isSearchFormValid()) {
      return;
    }
    // let soeid = this.searchForm.get('soeid')?.value || '';
    // remove all the spaces from soeid
    soeid = soeid.replace(/\s/g, '');
    const soeids = soeid.split(',');
    const onlyDefaultBranch = this.searchForm.get('onlyDefaultBranch')?.value || false;
    const datePeriod = this.searchForm.get('datePeriod');
    let startDate: string = '';
    let endDate: string = '';
    if (datePeriod?.value && datePeriod?.value.length === 2) {
      startDate = this.formatDate(datePeriod.value[0]);
      endDate = this.formatDate(datePeriod.value[1]);
    }
    setTimeout(() => {
      this.searchCommits(soeids, startDate, endDate, onlyDefaultBranch);
    }, 10);
    
  }

  isSearchFormValid(): boolean {
    const soeid = this.searchForm.get('soeid')?.value;

    if (!soeid) {
      this.msg.error('Please input SOEID(s)');
      return false;
    }

    return true;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} 00:00:00`;
  }

  searchCommits(soeids: string[], startDate: string, endDate: string, onlyDefaultBranch: boolean) {
    // call API to search commits
    this.bbContributionService.getCommitList(soeids, startDate, endDate, onlyDefaultBranch).subscribe((data: any) => {
      this.commitRecords = [];
      this.cachedAllCommitRecords = [];
      this.branchFilterValues = [];
      this.authorFilterValues = [];
      this.repoFilterValues = [];
      
      if (data.status === 'success') {
        this.commitRecords = data.formDetails;

        // add repo name for each records
        this.addOnCommitRepoName(this.commitRecords);

        // update the branch filter values
        this.updateBranchFilterValue(this.commitRecords);

        // update the author filter values
        this.updateAuthorFilterValues(this.commitRecords);

        // update the repo filter values
        this.updateRepoFilterValues(this.commitRecords);

        this.cachedAllCommitRecords = cloneDeep(this.commitRecords);
      }
    });

    // update query params in url, if the value is not empty
    this.populateQueryParams();
  }

  addOnCommitRepoName(commitRecords: CommitRecord[]) {
    // loop commitRecords, set field repoName as the first part of the commit link part between repos/ and /commits
    commitRecords.forEach((commitRecord: any) => {
      // get the repoName
      const commitLink = commitRecord.commit_link;
      if (commitLink) {
        const repoName = commitLink.split('repos/')[1].split('/commits')[0];
        commitRecord.repo_name = repoName;
      }
    });
  }

  updateBranchFilterValue(commitRecords: CommitRecord[]) {
    this.branchFilterValues = [];
    commitRecords.forEach((commitRecord: any) => {
      // get the branch and update in currentBranchList, avoid duplicate branch name
      const branchName = commitRecord.branch;
      if (branchName && !this.branchFilterValues.some((branch) => branch.value === branchName)) {
        const branch : TableFilterOption = {
          text: branchName,
          value: branchName
        };
        this.branchFilterValues.push(branch);
      }
    });
  }

  updateAuthorFilterValues(commitRecords: CommitRecord[]) {
    this.authorFilterValues = [];
    commitRecords.forEach((commitRecord: any) => {
      // get the author and update in currentAuthorList, avoid duplicate author name
      const authorName = commitRecord.author;
      if (authorName && !this.authorFilterValues.some((author) => author.value === authorName)) {
        const author : TableFilterOption = {
          text: authorName,
          value: authorName
        };
        this.authorFilterValues.push(author);
      }
    });
  }

  updateRepoFilterValues(commitRecords: CommitRecord[]) {
    this.repoFilterValues = [];
    commitRecords.forEach((commitRecord: any) => {
      // get the repo and update in currentRepoList, avoid duplicate repo name
      const repoName = commitRecord.repo_name;
      if (repoName && !this.repoFilterValues.some((repo) => repo.value === repoName)) {
        const repo : TableFilterOption = {
          text: repoName,
          value: repoName
        };
        this.repoFilterValues.push(repo);
      }
    });
  }

  filterBranch(filters: string[], commit: CommitRecord): boolean {
    return filters.some(branch => commit.branch === branch);
  };

  goFilterByBranches(filters: string[]): void {
    this.currentFilteredBranches = filters;
    this.executeTableFilter();
  }

  filterAuthor(filters: string[], commit: CommitRecord): boolean {
    return filters.some(author => commit.author === author);
  };

  goFilterByAuthors(filters: string[]): void {
    this.currentFilteredAuthors = filters;
    this.executeTableFilter();
  }

  filterRepo(filters: string[], commit: CommitRecord): boolean {
    return filters.some(repo => commit.repo_name === repo);
  };

  goFilterByRepos(filters: string[]): void {
    this.currentFilteredRepos = filters;
    this.executeTableFilter();
  }

  executeTableFilter() {
    // 1st, filter the auther
    // if no author is selected, then go with all the commit records
    if (this.currentFilteredAuthors.length === 0) {
      this.tempFilteredCommitRecords = this.cachedAllCommitRecords;
    } else {
      this.tempFilteredCommitRecords = this.cachedAllCommitRecords.filter(record => this.filterAuthor(this.currentFilteredAuthors, record));
    }
    // 2nd, filter the branch
    // only if branch is selected, then go with all the commit records
    if (this.currentFilteredBranches.length > 0) {
      this.tempFilteredCommitRecords = this.tempFilteredCommitRecords.filter(record => this.filterBranch(this.currentFilteredBranches, record));
    }
    // 3rd, filter the repo
    // only if repo is selected, then go with all the commit records
    if (this.currentFilteredRepos.length > 0) {
      this.tempFilteredCommitRecords = this.tempFilteredCommitRecords.filter(record => this.filterRepo(this.currentFilteredRepos, record));
    }

    this.commitRecords = this.tempFilteredCommitRecords;
  }

  resetFilters() {
    this.currentFilteredBranches = [];
    this.currentFilteredAuthors = [];
    const tempBranchFilterValues = cloneDeep(this.branchFilterValues);
    this.branchFilterValues = tempBranchFilterValues;
    const tempAuthorFilterValues = cloneDeep(this.authorFilterValues);
    this.authorFilterValues = tempAuthorFilterValues;
    const tempRepoFilterValues = cloneDeep(this.repoFilterValues);
    this.repoFilterValues = tempRepoFilterValues;
    this.commitRecords = this.cachedAllCommitRecords;
  }

  linkoutAuthor(authorUrl: string) {
    this.urlToolService.linkToOtherSite(authorUrl);
  }

  linkoutCommit(commitUrl: string) {
    this.urlToolService.linkToOtherSite(commitUrl);
  }

  linkoutRepo(repoLink: string) {
    this.urlToolService.linkToOtherSite(repoLink);
  }

  linkoutJira(jiraId: string) {
    this.urlToolService.linkToOtherSite(`https://cedt-gct-jira-ap.nam.nsroot.net/jira/browse/${jiraId}`);
  }

  linkoutPr(prLink: string) {
    this.urlToolService.linkToOtherSite(prLink);
  }

  exportCommitsToExcel() {
    if (!this.isSearchFormValid()) {
      return;
    }
    let soeid = this.searchForm.get('soeid')?.value || '';
    // remove all the spaces from soeid
    soeid = soeid.replace(/\s/g, '');
    const soeids = soeid.split(',');
    const onlyDefaultBranch = this.searchForm.get('onlyDefaultBranch')?.value || false;
    const datePeriod = this.searchForm.get('datePeriod');
    let startDate: string = '';
    let endDate: string = '';
    if (datePeriod?.value && datePeriod?.value.length === 2) {
      startDate = this.formatDate(datePeriod.value[0]);
      endDate = this.formatDate(datePeriod.value[1]);
    }
    // call API to export commits to excel
    this.bbContributionService.exportCommitsToExcel(soeids, startDate, endDate, onlyDefaultBranch);
  }

  resetSearchForm() {
    this.searchForm.reset();
    this.commitRecords = [];
    this.cachedAllCommitRecords = [];

    this.populateQueryParams();
  }

  populateQueryParams() {
    const soeid: string = this.searchForm.get('soeid')?.value as string;
    const onlyDefaultBranch = this.searchForm.get('onlyDefaultBranch')?.value || false;
    const datePeriod: Date[] = this.searchForm.get('datePeriod')?.value as Date[];
    // update query params in url, if the value is not empty
    const queryParams: {[key: string]: string} = {};
    if (soeid) {
      queryParams['soeid'] = soeid;
    }
    if (datePeriod && datePeriod.length === 2) {
      queryParams['startDate'] = this.formatDate(datePeriod[0]);
      queryParams['endDate'] = this.formatDate(datePeriod[1]);
    }
    if (onlyDefaultBranch) {
      queryParams['onlyDefaultBranch'] = 'true';
    }

    this.urlToolService.updateUrlQueryParams(queryParams);
  }

  getQueryParamFromUrl() {
    const soeid: string = this.route.snapshot.queryParams['soeid'];
    const startDate: string = this.route.snapshot.queryParams['startDate'];
    const endDate: string = this.route.snapshot.queryParams['endDate'];
    const onlyDefaultBranch: string = this.route.snapshot.queryParams['onlyDefaultBranch'];
    const datePeriod: Date[] = [];
    if (startDate && endDate) {
      datePeriod.push(new Date(startDate));
      datePeriod.push(new Date(endDate));
    }

    this.searchForm.patchValue({
      soeid: soeid,
      datePeriod: datePeriod,
      onlyDefaultBranch: onlyDefaultBranch === 'true' ? true : false
    });
  }

  refreshCommitRecords() {
    this.bbContributionService.refreshCommits().subscribe((data: any) => {
      // update the latest update info
      setTimeout(() => {
        this.getLastRefreshInfo();
      }, 1000);
    })
  }

  closeInstructionPopup(): void {
    this.isInstructionPopupVisible = false;
  }

  openInstructionPopup(): void {
    this.isInstructionPopupVisible = true;
  }

  contactAdminToAddRepo() {
    this.communicationToolService.openTeamsWindow(ADMIN_SOEID);
  }

}
