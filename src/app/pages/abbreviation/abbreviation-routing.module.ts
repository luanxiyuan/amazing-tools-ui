import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AbbreviationComponent } from './abbreviation.component';
import { AbbreviationSearchComponent } from './abbreviation-search/abbreviation-search.component';

const routes: Routes = [
  { path: '', component: AbbreviationComponent, children: [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: AbbreviationSearchComponent }
  ]},
  { path: '**', component: AbbreviationComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbbreviationRoutingModule { }