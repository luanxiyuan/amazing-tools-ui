import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'apiCtaColor'
})
export class ApiCtaColorPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'Loading':
        return 'blue';
      case 'Clicked':
        return 'green';
      case 'Swiped':
        return 'geekblue';
      case 'Checked':
        return 'purple';
      case 'Dropoff':
        return 'orange';
      case 'Option Selected':
        return 'volcano';
      case 'Focus Out':
        return 'red';
      case 'Pre Loading':
        return 'magenta';
      case 'CTA':
        return 'cyan';
      default:
        return 'default';
    }
  }

}
