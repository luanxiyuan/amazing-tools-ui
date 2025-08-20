import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'httpMethodColor'
})
export class HttpMethodColorPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'GET':
        return 'blue';
      case 'POST':
        return 'green';
      case 'PUT':
        return 'geekblue';
      case 'DELETE':
        return 'purple';
      default:
        return 'default';
    }
  }

}
