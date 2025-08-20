import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SwaggerViewerComponent } from './swagger-viewer.component';

const routes: Routes = [
  { path: '', component: SwaggerViewerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SwaggerViewerRoutingModule { }
