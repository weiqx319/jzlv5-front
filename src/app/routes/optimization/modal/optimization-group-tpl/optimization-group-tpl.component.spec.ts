import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OptimizationGroupTplComponent } from './optimization-group-tpl.component';

describe('OptimizationGroupTplComponent', () => {
  let component: OptimizationGroupTplComponent;
  let fixture: ComponentFixture<OptimizationGroupTplComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OptimizationGroupTplComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptimizationGroupTplComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
