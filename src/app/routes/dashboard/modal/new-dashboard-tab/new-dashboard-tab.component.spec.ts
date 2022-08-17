import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NewDashboardTabComponent } from './new-dashboard-tab.component';

describe('NewDashboardTabComponent', () => {
  let component: NewDashboardTabComponent;
  let fixture: ComponentFixture<NewDashboardTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NewDashboardTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDashboardTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
