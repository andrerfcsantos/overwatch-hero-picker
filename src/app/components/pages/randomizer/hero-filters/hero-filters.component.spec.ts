import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroFiltersComponent } from './hero-filters.component';

describe('HeroFiltersComponent', () => {
  let component: HeroFiltersComponent;
  let fixture: ComponentFixture<HeroFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeroFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
