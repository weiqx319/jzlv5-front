import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LandingPageTemplateComponent } from './landing-page-template.component';

describe('LandingPageTemplateComponent', () => {
  let component: LandingPageTemplateComponent;
  let fixture: ComponentFixture<LandingPageTemplateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingPageTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingPageTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
