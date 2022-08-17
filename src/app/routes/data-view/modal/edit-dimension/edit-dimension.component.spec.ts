import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditDimensionComponent } from './edit-dimension.component';

describe('EditDimensionComponent', () => {
  let component: EditDimensionComponent;
  let fixture: ComponentFixture<EditDimensionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDimensionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDimensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
