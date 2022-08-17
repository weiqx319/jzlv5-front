import { TestBed, inject } from '@angular/core/testing';

import { ReportChartService } from './report-chart.service';

describe('ReportChartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportChartService]
    });
  });

  it('should be created', inject([ReportChartService], (service: ReportChartService) => {
    expect(service).toBeTruthy();
  }));
});
