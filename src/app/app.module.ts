import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContentMainComponent } from './components/content/content-main/content-main.component';
import { HeroDisplayComponent } from './components/content/hero-display/hero-display.component';
import { HeroFiltersComponent } from './components/content/hero-filters/hero-filters.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { HeroCardComponent } from './components/content/hero-card/hero-card.component';
import { FooterComponent } from './components/footer/footer.component';


@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    HeroDisplayComponent,
    HeroFiltersComponent,
    ContentMainComponent,
    HeroCardComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
