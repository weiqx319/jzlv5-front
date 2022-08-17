import { TestBed, inject } from '@angular/core/testing';

import { RegionListService } from './region-list.service';

describe('RegionListService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RegionListService]
    });
  });

  it('should be created', inject([RegionListService], (service: RegionListService) => {
    expect(service).toBeTruthy();
  }));
});
