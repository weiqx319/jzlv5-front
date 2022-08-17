import { TestBed, inject } from '@angular/core/testing';

import { ChartStructureService } from './chart-structure.service';

describe('ChartStructureService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChartStructureService]
    });
  });

  it('should be created', inject([ChartStructureService], (service: ChartStructureService) => {
    expect(service).toBeTruthy();
  }));
});
