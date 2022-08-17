import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DashboardRightSidebarComponent } from './dashboard-right-sidebar.component';

describe('DashboardRightSidebarComponent', () => {
  let component: DashboardRightSidebarComponent;
  let fixture: ComponentFixture<DashboardRightSidebarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardRightSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardRightSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
