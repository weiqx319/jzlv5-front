import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OptimizationDetailEffectSettingComponent } from './optimization-detail-effect-setting.component';

describe('OptimizationDetailEffectSettingComponent', () => {
  let component: OptimizationDetailEffectSettingComponent;
  let fixture: ComponentFixture<OptimizationDetailEffectSettingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OptimizationDetailEffectSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptimizationDetailEffectSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
