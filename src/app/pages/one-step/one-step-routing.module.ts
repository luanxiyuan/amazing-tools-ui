import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OneStepComponent } from './one-step.component';

const routes: Routes = [
  {
    path: '', component: OneStepComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OneStepRoutingModule { }
