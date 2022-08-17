import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TradeRuleComponent } from './trade-rule.component';

describe('TradeRuleComponent', () => {
  let component: TradeRuleComponent;
  let fixture: ComponentFixture<TradeRuleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TradeRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
