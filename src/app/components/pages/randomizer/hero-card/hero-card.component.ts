import { Component, Input, OnInit } from '@angular/core';
import { Hero } from '../../../../models/hero';
import { HeroesService } from '../../../../services/heroes.service';


@Component({
  selector: 'app-hero-card',
  templateUrl: './hero-card.component.html',
  styleUrls: ['./hero-card.component.css']
})
export class HeroCardComponent implements OnInit {
  constructor(
    private heroesService: HeroesService
  ) { }

  @Input() hero: Hero;

  ngOnInit() {
  }

  toggle(hero: Hero) {
    this.heroesService.toggleHero(hero);
  }

}
