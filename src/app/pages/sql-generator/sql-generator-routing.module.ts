import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SqlGeneratorComponent } from './sql-generator.component';

const routes: Routes = [
  { 
    path: '', component: SqlGeneratorComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SqlGeneratorRoutingModule { }