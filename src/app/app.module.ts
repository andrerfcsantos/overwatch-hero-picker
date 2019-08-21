import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContentMainComponent } from './components/pages/randomizer/content-main/content-main.component';
import { HeroDisplayComponent } from './components/pages/randomizer/hero-display/hero-display.component';
import { HeroFiltersComponent } from './components/pages/randomizer/hero-filters/hero-filters.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { HeroCardComponent } from './components/pages/randomizer/hero-card/hero-card.component';
import { FooterComponent } from './components/footer/footer.component';
import { AboutMainComponent } from './components/pages/about/about-main/about-main.component';


@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    HeroDisplayComponent,
    HeroFiltersComponent,
    ContentMainComponent,
    HeroCardComponent,
    FooterComponent,
    AboutMainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
