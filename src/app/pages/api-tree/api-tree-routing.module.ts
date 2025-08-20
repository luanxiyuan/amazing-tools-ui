import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApiListComponent } from './api-list/api-list.component';
import { ApiTreeComponent } from './api-tree.component';

const routes: Routes = [
  { path: '', component: ApiTreeComponent, children: [
    { path: '', redirectTo: 'api-list', pathMatch: 'full'},
    { path: 'api-list', component: ApiListComponent },
  ] },
  { path: '**', component: ApiTreeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApiTreeRoutingModule { }
