import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickEditKeywordPriceSingleComponent } from './quick-edit-keyword-price-single.component';

describe('QuickEditKeywordPriceSingleComponent', () => {
  let component: QuickEditKeywordPriceSingleComponent;
  let fixture: ComponentFixture<QuickEditKeywordPriceSingleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickEditKeywordPriceSingleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickEditKeywordPriceSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
