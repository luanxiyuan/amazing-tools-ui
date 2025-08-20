import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },
  { path: 'ui-marker', loadChildren: () => import('./pages/ui-marker/ui-marker.module').then(m => m.UiMarkerModule) },
  { path: 'contacts', loadChildren: () => import('./pages/contacts/contacts.module').then(m => m.ContactsModule) },
  { path: 'abbreviations', loadChildren: () => import('./pages/abbreviation/abbreviation.module').then(m => m.AbbreviationModule) },
  { path: 'xsd-converter', loadChildren: () => import('./pages/xsd-converter/xsd-converter.module').then(m => m.XsdConverterModule) },
  { path: 'swagger-viewer', loadChildren: () => import('./pages/swagger-viewer/swagger-viewer.module').then(m => m.SwaggerViewerModule) },
  { path: 'api-tree', loadChildren: () => import('./pages/api-tree/api-tree.module').then(m => m.ApiTreeModule) },
  { path: 'bb-contribution', loadChildren: () => import('./pages/bb-contribution/bb-contribution.module').then(m => m.BbContributionModule) },
  { path: 'json-tool', loadChildren: () => import('./pages/json-tool/json-tool.module').then(m => m.JsonToolModule) },
  { path: 'one-step', loadChildren: () => import('./pages/one-step/one-step.module').then(m => m.OneStepModule) },
  { path: 'base64-converter', loadChildren: () => import('./pages/base64-converter/base64-converter.module').then(m => m.Base64ConverterModule) },
  { path: 'home-v2', loadChildren: () => import('./pages/home-v2/home-v2.module').then(m => m.HomeV2Module) },
  { path: '**', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
