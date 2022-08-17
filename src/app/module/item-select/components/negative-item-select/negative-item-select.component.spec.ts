import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NegativeItemSelectComponent } from './negative-item-select.component';

describe('NegativeItemSelectComponent', () => {
  let component: NegativeItemSelectComponent;
  let fixture: ComponentFixture<NegativeItemSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NegativeItemSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NegativeItemSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
