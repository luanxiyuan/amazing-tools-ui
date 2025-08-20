import { Component, Input } from '@angular/core';
import { SharedStoreService } from '../../../services/common/shared-store.service';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {
  constructor(
    public sharedStoreService: SharedStoreService
  ) {}

  @Input() size: 'small' | 'default' | 'large' = 'default';
}
