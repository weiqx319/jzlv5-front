import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricSettingComponent } from './metric-setting.component';

describe('MetricSettingComponent', () => {
  let component: MetricSettingComponent;
  let fixture: ComponentFixture<MetricSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetricSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
