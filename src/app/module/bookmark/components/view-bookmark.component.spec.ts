import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewBookmarkComponent } from './view-bookmark.component';

describe('ViewBookmarkComponent', () => {
  let component: ViewBookmarkComponent;
  let fixture: ComponentFixture<ViewBookmarkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewBookmarkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBookmarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
