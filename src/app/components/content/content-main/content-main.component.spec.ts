import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentMainComponent } from './content-main.component';

describe('ContentMainComponent', () => {
  let component: ContentMainComponent;
  let fixture: ComponentFixture<ContentMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
