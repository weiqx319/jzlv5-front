import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TradeMarkListComponent } from './trade-mark-list.component';

describe('TradeMarkListComponent', () => {
  let component: TradeMarkListComponent;
  let fixture: ComponentFixture<TradeMarkListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TradeMarkListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeMarkListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
