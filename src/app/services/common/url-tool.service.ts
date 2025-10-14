import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SharedStoreService } from './shared-store.service';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UrlToolService {

  private newWindow: Window | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedStoreService: SharedStoreService
  ) { 
    this.monitorUrlChanges();
  }

  private monitorUrlChanges(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const tabValue = this.getContactsTabValueFromPath();
      // if contactTab in 'team' | 'person'
      if (tabValue === 'team' || tabValue === 'person') {
        this.sharedStoreService.setContactsTabValue(tabValue as 'team' | 'person');
      }
    });
  }

  getContactsTabValueFromPath(): string {
    const currentUri = this.getCurrentUri();
    let path = '';
    if (currentUri.includes('home-v2')) {
      // remove /home-v2
      path = currentUri.replace('/home-v2', '');
    } else {
      path = currentUri;
    }
    // Extract the contacts tab value from the current URL path
    const prefix = '/contacts/';
    if (path.startsWith(prefix)) {
      const value = path.substring(prefix.length);
      // substriing the value which before the first '/', which is the contacts tab
      return value.split('/')[0];
    }
    return '';
  }

  updateUrlQueryParam(paramName: string, paramValue: string): void {
    // Get the current URL parameters
    const queryParams = { ...this.route.snapshot.queryParams };

    // Update the specific parameter
    queryParams[paramName] = paramValue;

    // Navigate to the same route with updated query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge' // merge with existing query parameters
    });
  }

  updateUrlQueryParams(queryParams: { [key: string]: string }): void {
    // Get the current URL parameters
    const currentQueryParams: { [key: string]: string } = {};

    // Update the specific parameter
    Object.keys(queryParams).forEach(key => {
      currentQueryParams[key] = queryParams[key];
    });

    // Navigate to the same route with updated query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: currentQueryParams
    });
  }

  getUrlQueryParam(paramName: string): string {
    return this.route.snapshot.queryParams[paramName] || '';
  }

  createUriRegex(uri: string): RegExp {
    // Replace placeholders like {0}, {id}, {cardid}, etc., with a pattern that matches any single segment
    const uriPattern = this.normalizeUriForPartialMatch(uri);
    return new RegExp(`^${uriPattern}`, 'i'); // 'i' flag for case-insensitive matching
  }

  createUriFullMatchRegex(uri: string): RegExp {
    // Replace placeholders like {0} with a pattern that matches any single segment
    const uriPattern = this.normalizeUriForFullMatch(uri);
    return new RegExp(`^${uriPattern}$`, 'i'); // 'i' flag for case-insensitive matching
  }

  partialMatchUriWithVariables(searchUri: string, comparedUri: string, ignoreCaseFlag: boolean = true): boolean {
    const regex = this.createUriRegex(searchUri);
    return ignoreCaseFlag ? regex.test(comparedUri.toLowerCase()) : regex.test(comparedUri);
  }

  exactMatchUriWithVariables(searchUri: string, comparedUri: string, ignoreCaseFlag: boolean = true): boolean {
    const regex = this.createUriFullMatchRegex(searchUri); // 'i' flag for case-insensitive matching
    return ignoreCaseFlag ? regex.test(comparedUri.toLowerCase()) : regex.test(comparedUri);
  }

  formatUri(uri: string): string {
    // if uri includes 'uris.jws', remove all part before 'uris.jws', includes 'uris.jws'
    const keyword = 'uris.jws';
    const keywordIndex = uri.indexOf(keyword);
    if (keywordIndex !== -1) {
      const length = keyword.length;
      uri = uri.substring(keywordIndex + length);
    }
  
    // add / at the beginning of uri, remove / at the end of uri
    if (!uri.startsWith('/')) {
      uri = '/' + uri;
    }
    if (uri.endsWith('/')) {
      uri = uri.slice(0, -1);
    }
  
    return uri;
  }

  normalizeUriForPartialMatch(uri: string): string {
    uri = this.formatUri(uri);
    // Add wildcard patterns at the beginning and end to allow partial matching
    return '.*' + uri.toLowerCase().replace(/{[^}]*}/g, '[^/]*') + '.*';
  }

  normalizeUriForFullMatch(uri: string): string {
    uri = this.formatUri(uri);
    return uri.toLowerCase().replace(/{[^}]*}/g, '[^/]*');
  }

  // write a function to get the current uri
  getCurrentUri(): string {
    // Get the current URL
    const currentUrl = window.location.href;
    // Extract the URI part from the URL
    const uri = new URL(currentUrl).pathname;
    return this.formatUri(uri);
  }

  navigateTo(uri: string, queryParams: any): void {
    const currentUri = this.getCurrentUri();
    let navigateUri = '';
    if (currentUri.includes('home-v2')) {
      navigateUri = `/home-v2${uri}`;
    } else {
      navigateUri = `${uri}`;
    }
    this.router.navigate([navigateUri], {
      queryParams: queryParams,
    });
  }

  navigateToUri(uri: string): string {
    const currentUri = this.getCurrentUri();
    let navigateUri = '';
    if (currentUri.includes('home-v2')) {
      navigateUri = `/home-v2${uri}`;
    } else {
      navigateUri = `${uri}`;
    }
    return navigateUri;
  }

  linkToOtherSite(uri: string, newWindowFlag: boolean = true, autoCloseAfter: number = 0): void {
    if (newWindowFlag) {
      this.newWindow = window.open(uri, '_blank');
    } else {
      this.newWindow = window.open(uri);
    }

    if (autoCloseAfter > 0) {
      setTimeout(() => {
        if (this.newWindow) {
          this.newWindow.close();
          this.newWindow = null;
        }
      }, autoCloseAfter)
    } else {
      this.newWindow = null;
    }
  }
}
