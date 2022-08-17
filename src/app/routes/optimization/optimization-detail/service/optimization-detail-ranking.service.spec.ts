import { TestBed, inject } from '@angular/core/testing';

import { OptimizationDetailRankingService } from './optimization-detail-ranking.service';

describe('OptimizationDetailRankingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OptimizationDetailRankingService]
    });
  });

  it('should be created', inject([OptimizationDetailRankingService], (service: OptimizationDetailRankingService) => {
    expect(service).toBeTruthy();
  }));
});
