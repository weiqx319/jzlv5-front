import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MonitorModuleListComponent } from './monitor-module-list.component';

describe('MonitorModuleListComponent', () => {
  let component: MonitorModuleListComponent;
  let fixture: ComponentFixture<MonitorModuleListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitorModuleListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorModuleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
