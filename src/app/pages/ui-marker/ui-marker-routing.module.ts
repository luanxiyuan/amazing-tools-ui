import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UiMarkerComponent } from './ui-marker.component';
import { PageDetailComponent } from './page-detail/page-detail.component';
import { PageListComponent } from './page-list/page-list.component';

const routes: Routes = [
  // auto redirect to page-list
  
  { path: '', component: UiMarkerComponent, children: [
    { path: '', redirectTo: 'page-list', pathMatch: 'full'},
    { path: 'page-list', component: PageListComponent },
    { path: 'page-detail', component: PageDetailComponent }
  ]},
  { path: '**', component: UiMarkerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UiMarkerRoutingModule { }
