import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LandingPageModalComponent } from './landing-page-modal.component';

describe('LandingPageModalComponent', () => {
  let component: LandingPageModalComponent;
  let fixture: ComponentFixture<LandingPageModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingPageModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingPageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
