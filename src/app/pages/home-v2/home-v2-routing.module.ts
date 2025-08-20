import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeV2Component } from './home-v2.component';
import { HomeComponent } from '../home/home.component';
import { UiMarkerComponent } from '../ui-marker/ui-marker.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { AbbreviationComponent } from '../abbreviation/abbreviation.component';
import { XsdConverterComponent } from '../xsd-converter/xsd-converter.component';
import { SwaggerViewerComponent } from '../swagger-viewer/swagger-viewer.component';
import { ApiTreeComponent } from '../api-tree/api-tree.component';
import { BbContributionComponent } from '../bb-contribution/bb-contribution.component';
import { JsonToolComponent } from '../json-tool/json-tool.component';
import { OneStepComponent } from '../one-step/one-step.component';
import { Base64ConverterComponent } from '../base64-converter/base64-converter.component';
import { PageListComponent } from '../ui-marker/page-list/page-list.component';
import { PageDetailComponent } from '../ui-marker/page-detail/page-detail.component';
import { AbbreviationSearchComponent } from '../abbreviation/abbreviation-search/abbreviation-search.component';
import { ApiListComponent } from '../api-tree/api-list/api-list.component';
import { CommitListComponent } from '../bb-contribution/commit-list/commit-list.component';
import { ContactsPersonComponent } from '../contacts/contacts-person/contacts-person.component';
import { ContactsTeamComponent } from '../contacts/contacts-team/contacts-team.component';

const routes: Routes = [
  { path: '', component: HomeV2Component, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'ui-marker', component: UiMarkerComponent, children: [
          { path: '', redirectTo: 'page-list', pathMatch: 'full'},
          { path: 'page-list', component: PageListComponent },
          { path: 'page-detail', component: PageDetailComponent }
        ] 
      },
      { path: 'contacts', component: ContactsComponent, children: [
          { path: '', redirectTo: 'person', pathMatch: 'full' },
          { path: 'person', component: ContactsPersonComponent },
          { path: 'team', component: ContactsTeamComponent }
        ] 
      },
      { path: 'abbreviations', component: AbbreviationComponent, children: [
          { path: '', redirectTo: 'search', pathMatch: 'full' },
          { path: 'search', component: AbbreviationSearchComponent }
        ] 
      },
      { path: 'xsd-converter', component: XsdConverterComponent },
      { path: 'swagger-viewer', component: SwaggerViewerComponent },
      { path: 'api-tree', component: ApiTreeComponent, children: [
          { path: '', redirectTo: 'api-list', pathMatch: 'full'},
          { path: 'api-list', component: ApiListComponent },
        ]
      },
      { path: 'bb-contribution', component: BbContributionComponent, children: [
          { path: '', redirectTo: 'commit-list', pathMatch: 'full' },
          { path: 'commit-list', component: CommitListComponent },
        ] 
      },
      { path: 'json-tool', component: JsonToolComponent },
      { path: 'one-step', component: OneStepComponent },
      { path: 'base64-converter', component: Base64ConverterComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeV2RoutingModule { }
