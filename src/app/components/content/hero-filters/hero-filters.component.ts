import { Component, OnInit } from '@angular/core';
import { HeroesService } from '../../../services/heroes.service';
import { Hero } from 'src/app/models/hero';
import { Role } from 'src/app/models/role';


@Component({
  selector: 'app-hero-filters',
  templateUrl: './hero-filters.component.html',
  styleUrls: ['./hero-filters.component.css']
})
export class HeroFiltersComponent implements OnInit {

  heroes: Hero[];

  constructor(
    private heroesService: HeroesService
  ) { }

  ngOnInit() {
    this.heroes = this.heroesService.getHeroes();
  }

  getTanks(): Hero[] {
    return this.heroes.filter((h) => h.role === Role.TANK);
  }

  getDamage(): Hero[] {
    return this.heroes.filter((h) => h.role === Role.DAMAGE);
  }

  getSupport(): Hero[] {
    return this.heroes.filter((h) => h.role === Role.SUPPORT);
  }

  setSelectedAll(selectedVal: boolean) {
    this.setSelectedTanks(selectedVal);
    this.setSelectedDamage(selectedVal);
    this.setSelectedSupport(selectedVal);
  }

  setSelectedTanks(selectedVal: boolean) {
    this.getTanks().map((h) => h.selected = selectedVal);
  }

  setSelectedDamage(selectedVal: boolean) {
    this.getDamage().map((h) => h.selected = selectedVal);
  }

  setSelectedSupport(selectedVal: boolean) {
    this.getSupport().map((h) => h.selected = selectedVal);
  }


}
