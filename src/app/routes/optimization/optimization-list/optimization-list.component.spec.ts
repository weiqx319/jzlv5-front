import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OptimizationListComponent } from './optimization-list.component';

describe('OptimizationListComponent', () => {
  let component: OptimizationListComponent;
  let fixture: ComponentFixture<OptimizationListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OptimizationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptimizationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
