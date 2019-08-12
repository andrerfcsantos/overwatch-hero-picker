import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentMainComponent } from './components/content/content-main/content-main.component';

const routes: Routes = [
  { path: '', component: ContentMainComponent },
  { path: 'picker', component: ContentMainComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
