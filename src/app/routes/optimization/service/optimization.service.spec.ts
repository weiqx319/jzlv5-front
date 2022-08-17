import { TestBed, inject } from '@angular/core/testing';

import { OptimizationService } from './optimization.service';

describe('OptimizationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OptimizationService]
    });
  });

  it('should be created', inject([OptimizationService], (service: OptimizationService) => {
    expect(service).toBeTruthy();
  }));
});
