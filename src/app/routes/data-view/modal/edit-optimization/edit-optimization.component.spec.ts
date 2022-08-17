import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditOptimizationComponent } from './edit-optimization.component';

describe('EditOptimizationComponent', () => {
  let component: EditOptimizationComponent;
  let fixture: ComponentFixture<EditOptimizationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditOptimizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOptimizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
