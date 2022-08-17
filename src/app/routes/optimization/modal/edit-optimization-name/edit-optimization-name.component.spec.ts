import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditOptimizationNameComponent } from './edit-optimization-name.component';

describe('EditOptimizationNameComponent', () => {
  let component: EditOptimizationNameComponent;
  let fixture: ComponentFixture<EditOptimizationNameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditOptimizationNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOptimizationNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
