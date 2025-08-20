import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JsonToolComponent } from './json-tool.component';

const routes: Routes = [
  {
    path: '', component: JsonToolComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JsonToolRoutingModule { }
