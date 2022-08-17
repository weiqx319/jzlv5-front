import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OptimizationDetailEffectKwdListComponent } from './optimization-detail-effect-kwd-list.component';

describe('OptimizationDetailEffectKwdListComponent', () => {
  let component: OptimizationDetailEffectKwdListComponent;
  let fixture: ComponentFixture<OptimizationDetailEffectKwdListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OptimizationDetailEffectKwdListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptimizationDetailEffectKwdListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
