import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickEditFeedBudgetComponent } from './quick-edit-feed-budget.component';

describe('QuickEditFeedBudgetComponent', () => {
  let component: QuickEditFeedBudgetComponent;
  let fixture: ComponentFixture<QuickEditFeedBudgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickEditFeedBudgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickEditFeedBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
