import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddOptimizationGroupTplComponent } from './add-optimization-group-tpl.component';

describe('AddOptimizationGroupTplComponent', () => {
  let component: AddOptimizationGroupTplComponent;
  let fixture: ComponentFixture<AddOptimizationGroupTplComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddOptimizationGroupTplComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOptimizationGroupTplComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
