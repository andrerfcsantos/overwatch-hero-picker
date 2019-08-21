import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentMainComponent } from './components/pages/randomizer/content-main/content-main.component';
import { AboutMainComponent } from './components/pages/about/about-main/about-main.component';

const routes: Routes = [
  { path: '', component: ContentMainComponent },
  { path: 'about', component: AboutMainComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
