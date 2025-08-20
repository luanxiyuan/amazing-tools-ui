import { Injectable } from '@angular/core';
import { MONTHS } from '../../consts/sys-consts';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }

  generateMonthDaysObject(): any {
    const months = MONTHS;

    const days29 = this.generateDays(29);
    const days30 = this.generateDays(30);
    const days31 = this.generateDays(31);
  
    const monthDaysObject = months.map((month) => {
      if (month === 'Feb') {
        return {
          value: month,
          label: month,
          children: days29
        };
      } else if (['Apr', 'Jun', 'Sep', 'Nov'].includes(month)) {
        return {
          value: month,
          label: month,
          children: days30
        };
      } else if (['Jan', 'Mar', 'May', 'Jul', 'Aug', 'Oct', 'Dec'].includes(month)) {
        return {
          value: month,
          label: month,
          children: days31
        };
      } else {
        return {};
      }
    });
  
    return monthDaysObject;
  }

  generateDays(daysCount: number): any {
    const days = Array.from({ length: daysCount }, (_, dayIndex) => ({
      value: `${dayIndex + 1}`,
      label: `${dayIndex + 1}`,
      isLeaf: true
    })
    );
    return days;
  }

}
