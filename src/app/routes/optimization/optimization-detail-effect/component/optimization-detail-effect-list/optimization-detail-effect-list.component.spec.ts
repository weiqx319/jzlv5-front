import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OptimizationDetailEffectListComponent } from './optimization-detail-effect-list.component';

describe('OptimizationDetailEffectListComponent', () => {
  let component: OptimizationDetailEffectListComponent;
  let fixture: ComponentFixture<OptimizationDetailEffectListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OptimizationDetailEffectListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptimizationDetailEffectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
