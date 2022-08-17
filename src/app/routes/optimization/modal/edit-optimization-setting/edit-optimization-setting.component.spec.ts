import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditOptimizationSettingComponent } from './edit-optimization-setting.component';

describe('EditOptimizationSettingComponent', () => {
  let component: EditOptimizationSettingComponent;
  let fixture: ComponentFixture<EditOptimizationSettingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditOptimizationSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOptimizationSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
