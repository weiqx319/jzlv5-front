import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditAutomaticMonitoringComponent } from './edit-automatic-monitoring.component';

describe('EditAutomaticMonitoringComponent', () => {
  let component: EditAutomaticMonitoringComponent;
  let fixture: ComponentFixture<EditAutomaticMonitoringComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAutomaticMonitoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAutomaticMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
