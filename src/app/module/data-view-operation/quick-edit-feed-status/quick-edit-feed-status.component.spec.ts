import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickEditFeedStatusComponent } from './quick-edit-feed-status.component';

describe('QuickEditFeedStatusComponent', () => {
  let component: QuickEditFeedStatusComponent;
  let fixture: ComponentFixture<QuickEditFeedStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickEditFeedStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickEditFeedStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
