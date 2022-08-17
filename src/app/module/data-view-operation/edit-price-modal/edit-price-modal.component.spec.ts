import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditPriceModalComponent } from './edit-price-modal.component';

describe('EditPriceModalComponent', () => {
  let component: EditPriceModalComponent;
  let fixture: ComponentFixture<EditPriceModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPriceModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPriceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
