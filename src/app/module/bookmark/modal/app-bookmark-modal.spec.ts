import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppBookmarkModalComponent } from './app-bookmark-modal.component';

describe('NewDashboardTabComponent', () => {
  let component: AppBookmarkModalComponent;
  let fixture: ComponentFixture<AppBookmarkModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AppBookmarkModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppBookmarkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
