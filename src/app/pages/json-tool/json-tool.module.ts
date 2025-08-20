import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

import { SharedModule } from '../common/shared.module';

import { JsonToolRoutingModule } from './json-tool-routing.module';
import { JsonToolComponent } from './json-tool.component';


@NgModule({
  declarations: [
    JsonToolComponent
  ],
  imports: [
    CommonModule,
    JsonToolRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NzButtonModule,
    NzCardModule,
    NzAvatarModule,
    NzTypographyModule,
    NzDividerModule, 
    NzSpaceModule, 
    NzAffixModule, 
    NzBreadCrumbModule, 
    NzDropDownModule, 
    NzMenuModule, 
    NzPageHeaderModule, 
    NzAutocompleteModule, 
    NzCascaderModule, 
    NzFormModule, 
    NzInputModule, 
    NzInputNumberModule, 
    NzSelectModule, 
    NzUploadModule, 
    NzCarouselModule, 
    NzCollapseModule, 
    NzEmptyModule, 
    NzImageModule, 
    NzListModule, 
    NzPopoverModule, 
    NzSegmentedModule, 
    NzTableModule, 
    NzTabsModule, 
    NzTagModule, 
    NzTimelineModule, 
    NzToolTipModule, 
    NzAlertModule, 
    NzDrawerModule, 
    NzMessageModule, 
    NzModalModule, 
    NzPopconfirmModule, 
    NzProgressModule, 
    NzResultModule, 
    NzSpinModule, 
    NzBackTopModule,
    NzLayoutModule,
    NzRadioModule,
    NzIconModule,
    NzBadgeModule,
    NzDatePickerModule,
    NzSwitchModule
  ]
})
export class JsonToolModule { }
