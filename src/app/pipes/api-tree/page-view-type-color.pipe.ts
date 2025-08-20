import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pageViewTypeColor'
})
export class PageViewTypeColorPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'Web':
        return 'geekblue';
      case 'Mobile':
        return 'purple';
      default:
        return 'default';
    }
  }

}
