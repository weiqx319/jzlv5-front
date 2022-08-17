import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TradeMarkEditItemComponent } from './trade-mark-edit-item.component';

describe('TradeMarkEditItemComponent', () => {
  let component: TradeMarkEditItemComponent;
  let fixture: ComponentFixture<TradeMarkEditItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TradeMarkEditItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeMarkEditItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
