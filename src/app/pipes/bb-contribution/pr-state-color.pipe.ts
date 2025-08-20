import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prStateColor'
})
export class PrStateColorPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'OPEN':
        return '#2db7f5';
      case 'MERGED':
        return '#87d068';
      case 'DECLINED':
          return '#f50';
      case 'SUPERSEDED':
          return '#108ee9';
      default:
        return 'default';
    }
  }

}
