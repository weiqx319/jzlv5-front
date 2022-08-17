import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OptimizationDetailListComponent } from './optimization-detail-list.component';

describe('OptimizationDetailListComponent', () => {
  let component: OptimizationDetailListComponent;
  let fixture: ComponentFixture<OptimizationDetailListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OptimizationDetailListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptimizationDetailListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
