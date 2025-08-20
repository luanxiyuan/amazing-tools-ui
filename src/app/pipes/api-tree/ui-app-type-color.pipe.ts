import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uiAppTypeColor'
})
export class UiAppTypeColorPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'GFT':
        return '#2db7f5';
      case 'CBOL':
        return '#87d068';
      case 'MBOL':
          return '#108ee9';
      default:
        return 'default';
    }
  }

}
