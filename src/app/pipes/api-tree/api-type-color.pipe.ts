import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'apiClassificationColor'
})
export class ApiClassificationColorPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'Open':
        return '#2db7f5';
      case 'Private':
        return '#87d068';
      case 'Partner':
          return '#108ee9';
      default:
        return 'default';
    }
  }

}
