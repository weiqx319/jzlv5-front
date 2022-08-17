import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SetSummaryTimeComponent } from './set-summary-time.component';

describe('SetSummaryTimeComponent', () => {
  let component: SetSummaryTimeComponent;
  let fixture: ComponentFixture<SetSummaryTimeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SetSummaryTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetSummaryTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
