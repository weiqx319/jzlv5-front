import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MonitorModuleDetailComponent } from './monitor-module-detail.component';

describe('MonitorModuleDetailComponent', () => {
  let component: MonitorModuleDetailComponent;
  let fixture: ComponentFixture<MonitorModuleDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitorModuleDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorModuleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
