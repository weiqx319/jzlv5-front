import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickEditKeywordPriceBatchComponent } from './quick-edit-keyword-price-batch.component';

describe('QuickEditKeywordPriceBatchComponent', () => {
  let component: QuickEditKeywordPriceBatchComponent;
  let fixture: ComponentFixture<QuickEditKeywordPriceBatchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickEditKeywordPriceBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickEditKeywordPriceBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
