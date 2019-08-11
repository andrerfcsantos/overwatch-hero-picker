import { Component, OnInit } from '@angular/core';
import { Hero } from 'src/app/models/hero';
import { HeroesService } from '../../../services/heroes.service';

@Component({
  selector: 'app-hero-display',
  templateUrl: './hero-display.component.html',
  styleUrls: ['./hero-display.component.css']
})
export class HeroDisplayComponent implements OnInit {

  hero: Hero;

  constructor(private heroService: HeroesService) { }

  ngOnInit() {
    this.randomHero();

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyR') {
        this.randomHero();
      }
    });

  }

  randomHero() {
    this.hero = this.heroService.randomHero();
  }

}
