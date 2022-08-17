import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditPriceMessageModalComponent } from './edit-price-message-modal.component';

describe('EditPriceMessageOptimizationComponent', () => {
  let component: EditPriceMessageModalComponent;
  let fixture: ComponentFixture<EditPriceMessageModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPriceMessageModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPriceMessageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
