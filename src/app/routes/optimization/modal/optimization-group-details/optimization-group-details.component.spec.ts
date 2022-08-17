import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OptimizationGroupDetailsComponent } from './optimization-group-details.component';

describe('OptimizationGroupDetailsComponent', () => {
  let component: OptimizationGroupDetailsComponent;
  let fixture: ComponentFixture<OptimizationGroupDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OptimizationGroupDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptimizationGroupDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
