import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportChartShowComponent } from './report-chart-show.component';

describe('ReportChartShowComponent', () => {
  let component: ReportChartShowComponent;
  let fixture: ComponentFixture<ReportChartShowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportChartShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportChartShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
