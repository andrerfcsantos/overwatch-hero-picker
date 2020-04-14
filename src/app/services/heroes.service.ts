import { Injectable } from '@angular/core';
import { Hero } from '../models/hero';
import { Role } from '../models/role';


@Injectable({
  providedIn: 'root'
})
export class HeroesService {

  constructor() {
    this.HEROES.sort((a, b) => a.name < b.name ? -1 : 1);
  }

  HEROES: Hero[] = [
    {
      name: 'D.Va',
      role: Role.TANK,
      selected: false,
      key: 'dva',
    },
    {
      name: 'Orisa',
      role: Role.TANK,
      selected: false,
      key: 'orisa',
    },
    {
      name: 'Reinhardt',
      role: Role.TANK,
      selected: false,
      key: 'reinhardt',
    },
    {
      name: 'Roadhog',
      role: Role.TANK,
      selected: false,
      key: 'roadhog',
    },
    {
      name: 'Winston',
      role: Role.TANK,
      selected: false,
      key: 'winston',
    },
    {
      name: 'Wrecking Ball',
      role: Role.TANK,
      selected: false,
      key: 'wreckingball',
    },
    {
      name: 'Zarya',
      role: Role.TANK,
      selected: false,
      key: 'zarya',
    },
    {
      name: 'Bastion',
      role: Role.DAMAGE,
      selected: false,
      key: 'bastion',
    },
    {
      name: 'Doomfist',
      role: Role.DAMAGE,
      selected: false,
      key: 'doomfist',
    },
    {
      name: 'Genji',
      role: Role.DAMAGE,
      selected: false,
      key: 'genji',
    },
    {
      name: 'Hanzo',
      role: Role.DAMAGE,
      selected: false,
      key: 'hanzo',
    },
    {
      name: 'Junkrat',
      role: Role.DAMAGE,
      selected: false,
      key: 'junkrat',
    },
    {
      name: 'McCree',
      role: Role.DAMAGE,
      selected: false,
      key: 'mccree',
    },
    {
      name: 'Mei',
      role: Role.DAMAGE,
      selected: false,
      key: 'mei',
    },
    {
      name: 'Pharah',
      role: Role.DAMAGE,
      selected: false,
      key: 'pharah',
    },
    {
      name: 'Reaper',
      role: Role.DAMAGE,
      selected: false,
      key: 'reaper',
    },
    {
      name: 'Soldier: 76',
      role: Role.DAMAGE,
      selected: false,
      key: 'soldier76',
    },
    {
      name: 'Sombra',
      role: Role.DAMAGE,
      selected: false,
      key: 'sombra',
    },
    {
      name: 'Symmetra',
      role: Role.DAMAGE,
      selected: false,
      key: 'symmetra',
    },
    {
      name: 'Torbjörn',
      role: Role.DAMAGE,
      selected: false,
      key: 'torbjorn',
    },
    {
      name: 'Tracer',
      role: Role.DAMAGE,
      selected: false,
      key: 'tracer',
    },
    {
      name: 'Widowmaker',
      role: Role.DAMAGE,
      selected: false,
      key: 'widowmaker',
    },
    {
      name: 'Ana',
      role: Role.SUPPORT,
      selected: false,
      key: 'ana',
    },
    {
      name: 'Brigitte',
      role: Role.SUPPORT,
      selected: false,
      key: 'brigitte',
    },
    {
      name: 'Lúcio',
      role: Role.SUPPORT,
      selected: false,
      key: 'lucio',
    },
    {
      name: 'Mercy',
      role: Role.SUPPORT,
      selected: false,
      key: 'mercy',
    },
    {
      name: 'Moira',
      role: Role.SUPPORT,
      selected: false,
      key: 'moira',
    },
    {
      name: 'Zenyatta',
      role: Role.SUPPORT,
      selected: false,
      key: 'zenyatta',
    },
    {
      name: 'Baptiste',
      role: Role.SUPPORT,
      selected: false,
      key: 'baptiste',
    },
    {
      name: 'Sigma',
      role: Role.TANK,
      selected: false,
      key: 'sigma',
    },
    {
      name: 'Ashe',
      role: Role.DAMAGE,
      selected: false,
      key: 'ashe',
    },
    {
      name: 'Echo',
      role: Role.DAMAGE,
      selected: false,
      key: 'echo',
    }
  ];

  getHeroes(): Hero[] {
    return this.HEROES;
  }

  getSelected(): Hero[] {
    return this.HEROES.filter((h) => h.selected);
  }

  toggleHero(hero: Hero) {
    const idx = this.HEROES.findIndex((h) => h.name === hero.name);
    if (idx === -1) {
      return;
    }
    this.HEROES[idx].selected = !this.HEROES[idx].selected;
  }

  randomHero(): Hero {
    const selected = this.getSelected();

    if (selected.length === 0) {
      return this.HEROES[Math.floor(Math.random() * this.HEROES.length)];
    }
    return selected[Math.floor(Math.random() * selected.length)];
  }

  onlyTracerSelected(): boolean {
    const selected = this.getSelected();

    return selected.length === 1 && selected[0].name === 'Tracer';
  }


}
