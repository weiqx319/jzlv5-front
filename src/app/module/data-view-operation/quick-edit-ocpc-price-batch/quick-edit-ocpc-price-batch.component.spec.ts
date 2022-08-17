import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickEditOcpcPriceBatchComponent } from './quick-edit-ocpc-price-batch.component';

describe('QuickEditKeywordPriceBatchComponent', () => {
  let component: QuickEditOcpcPriceBatchComponent;
  let fixture: ComponentFixture<QuickEditOcpcPriceBatchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickEditOcpcPriceBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickEditOcpcPriceBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
