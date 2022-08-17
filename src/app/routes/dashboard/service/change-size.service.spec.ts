import { TestBed, inject } from '@angular/core/testing';

import { ChangeSizeService } from './change-size.service';

describe('ChangeSizeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChangeSizeService]
    });
  });

  it('should be created', inject([ChangeSizeService], (service: ChangeSizeService) => {
    expect(service).toBeTruthy();
  }));
});
