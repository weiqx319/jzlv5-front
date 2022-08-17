import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddTradeMarkComponent } from './add-trade-mark.component';

describe('AddTradeMarkComponent', () => {
  let component: AddTradeMarkComponent;
  let fixture: ComponentFixture<AddTradeMarkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTradeMarkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTradeMarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
