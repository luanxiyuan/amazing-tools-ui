import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { XsdConverterComponent } from './xsd-converter.component';

const routes: Routes = [
  { path: '', component: XsdConverterComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class XsdConverterRoutingModule { }
