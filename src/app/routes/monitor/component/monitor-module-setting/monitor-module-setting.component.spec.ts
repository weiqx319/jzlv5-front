import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MonitorModuleSettingComponent } from './monitor-module-setting.component';

describe('MonitorModuleSettingComponent', () => {
  let component: MonitorModuleSettingComponent;
  let fixture: ComponentFixture<MonitorModuleSettingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitorModuleSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorModuleSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
