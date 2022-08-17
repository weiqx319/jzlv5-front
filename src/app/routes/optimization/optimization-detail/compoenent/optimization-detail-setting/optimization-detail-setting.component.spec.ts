import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OptimizationDetailSettingComponent } from './optimization-detail-setting.component';

describe('OptimizationDetailSettingComponent', () => {
  let component: OptimizationDetailSettingComponent;
  let fixture: ComponentFixture<OptimizationDetailSettingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OptimizationDetailSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptimizationDetailSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
