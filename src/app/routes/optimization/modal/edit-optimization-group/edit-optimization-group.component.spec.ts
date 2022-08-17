import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditOptimizationGroupComponent } from './edit-optimization-group.component';

describe('EditOptimizationGroupComponent', () => {
  let component: EditOptimizationGroupComponent;
  let fixture: ComponentFixture<EditOptimizationGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditOptimizationGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOptimizationGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
