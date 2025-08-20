import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JsonToolService {

  constructor() { }

  getAllPathsByValue(
    json: any,
    valueToMatch: any,
    currentPath: string = ''
  ): { path: string; value: any }[] {
    const results: { path: string; value: any }[] = [];

    if (typeof json !== 'object' || json === null) {
      return results;
    }

    for (const key in json) {
      const value = json[key];
      const newPath = currentPath ? `${currentPath}/${key}` : key;

      if (value === valueToMatch) {
        results.push({ path: newPath, value: value });
      }

      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const arrayResults = this.getAllPathsByValue(value[i], valueToMatch, `${newPath}[]`);
          results.push(...arrayResults);
        }
      } else if (typeof value === 'object') {
        const nestedResults = this.getAllPathsByValue(value, valueToMatch, newPath);
        results.push(...nestedResults);
      }
    }

    return results;
  }

  getAllPathsByKey(
    json: any,
    label: string,
    currentPath: string = ''
  ): { path: string; value: any }[] {
    const results: { path: string; value: any }[] = [];

    if (typeof json !== 'object' || json === null) {
      return results;
    }

    for (const key in json) {
      const value = json[key];
      const newPath = currentPath ? `${currentPath}/${key}` : key;

      if (key === label) {
        results.push({ path: newPath, value: value });
      }

      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const arrayResults = this.getAllPathsByKey(value[i], label, `${newPath}[]`);
          results.push(...arrayResults);
        }
      } else if (typeof value === 'object') {
        const nestedResults = this.getAllPathsByKey(value, label, newPath);
        results.push(...nestedResults);
      }
    }

    return results;
  }

  extractValueList(json: any): any[] {
    const results: string[] = [];

    for (const key in json) {
      const value = json[key];

      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          results.push(...this.extractValueList(value[i]));
        }
      } else if (typeof value === 'object') {
        results.push(...this.extractValueList(value));
      } else {
        results.push(value);
      }
    }

    return results;
  }

}
