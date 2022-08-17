import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DataAnalysisChartComponent } from './data-analysis-chart.component';

describe('DataAnalysisChartComponent', () => {
  let component: DataAnalysisChartComponent;
  let fixture: ComponentFixture<DataAnalysisChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DataAnalysisChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataAnalysisChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
