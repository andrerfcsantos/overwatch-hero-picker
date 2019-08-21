import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutMainComponent } from './about-main.component';

describe('AboutMainComponent', () => {
  let component: AboutMainComponent;
  let fixture: ComponentFixture<AboutMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
