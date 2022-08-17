import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConstraintConditionViewComponent } from './constraint-condition-view.component';

describe('DateSelectViewComponent', () => {
  let component: ConstraintConditionViewComponent;
  let fixture: ComponentFixture<ConstraintConditionViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConstraintConditionViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstraintConditionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
