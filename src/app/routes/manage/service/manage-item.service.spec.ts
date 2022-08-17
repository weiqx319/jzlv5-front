import { TestBed, inject } from '@angular/core/testing';

import { ManageItemService } from './manage-item.service';

describe('ManageItemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ManageItemService]
    });
  });

  it('should be created', inject([ManageItemService], (service: ManageItemService) => {
    expect(service).toBeTruthy();
  }));
});
