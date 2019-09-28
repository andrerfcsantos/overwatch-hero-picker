import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentMainComponent } from './components/pages/randomizer/content-main/content-main.component';
import { AboutMainComponent } from './components/pages/about/about-main/about-main.component';
import { Main404Component } from './components/pages/404/main404/main404.component';


const routes: Routes = [
  { path: '', component: ContentMainComponent },
  { path: 'about', component: AboutMainComponent },
  { path: '404', component: Main404Component },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
