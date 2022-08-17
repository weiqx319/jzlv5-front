import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddTradeRuleComponent } from './add-trade-rule.component';

describe('AddTradeRuleComponent', () => {
  let component: AddTradeRuleComponent;
  let fixture: ComponentFixture<AddTradeRuleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTradeRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTradeRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
