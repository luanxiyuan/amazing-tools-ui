import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Base64ConverterComponent } from './base64-converter.component';

const routes: Routes = [
  { path: '', component: Base64ConverterComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Base64ConverterRoutingModule { }
