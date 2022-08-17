import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MonitorChartComponent } from './monitor-chart.component';

describe('MonitorChartComponent', () => {
  let component: MonitorChartComponent;
  let fixture: ComponentFixture<MonitorChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitorChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
