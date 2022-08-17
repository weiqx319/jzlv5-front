import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppBookmarkSaveModalComponent } from './app-bookmark-save-modal.component';

describe('AppBookmarkSaveModalComponent', () => {
  let component: AppBookmarkSaveModalComponent;
  let fixture: ComponentFixture<AppBookmarkSaveModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AppBookmarkSaveModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppBookmarkSaveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
