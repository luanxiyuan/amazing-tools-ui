import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BbContributionComponent } from './bb-contribution.component';
import { CommitListComponent } from './commit-list/commit-list.component';

const routes: Routes = [
  {
    path: '', component: BbContributionComponent, children: [
      { path: '', redirectTo: 'commit-list', pathMatch: 'full' },
      { path: 'commit-list', component: CommitListComponent },
    ]
  },
  { path: '**', component: BbContributionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class BbContributionRoutingModule { }
