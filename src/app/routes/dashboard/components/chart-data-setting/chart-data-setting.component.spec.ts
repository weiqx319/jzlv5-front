import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartDataSettingComponent } from './chart-data-setting.component';

describe('ChartDataSettingComponent', () => {
  let component: ChartDataSettingComponent;
  let fixture: ComponentFixture<ChartDataSettingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartDataSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartDataSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
