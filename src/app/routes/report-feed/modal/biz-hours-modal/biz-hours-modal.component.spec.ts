import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BizHoursModalComponent } from './biz-hours-modal.component';

describe('BizHoursModalComponent', () => {
  let component: BizHoursModalComponent;
  let fixture: ComponentFixture<BizHoursModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BizHoursModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BizHoursModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
