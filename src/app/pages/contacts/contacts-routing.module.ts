import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactsComponent } from './contacts.component';
import { ContactsPersonComponent } from './contacts-person/contacts-person.component';
import { ContactsTeamComponent } from './contacts-team/contacts-team.component';

const routes: Routes = [
  {
    path: '', component: ContactsComponent, children: [
      { path: '', redirectTo: 'team', pathMatch: 'full' },
      { path: 'person', component: ContactsPersonComponent },
      { path: 'team', component: ContactsTeamComponent }
    ]
  },
  { path: '**', component: ContactsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactsRoutingModule { }