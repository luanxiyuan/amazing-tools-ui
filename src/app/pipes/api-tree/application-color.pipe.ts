import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'applicationColor'
})
export class ApplicationColorPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'CPC':
        return 'geekblue';
      case 'CPB':
        return 'purple';
      default:
        return 'default';
    }
  }

}
