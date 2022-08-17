import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MonitorModuleLogComponent } from './monitor-module-log.component';

describe('MonitorModuleLogComponent', () => {
  let component: MonitorModuleLogComponent;
  let fixture: ComponentFixture<MonitorModuleLogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitorModuleLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorModuleLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
