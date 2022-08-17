import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickEditFeedMaskPreferComponent } from './quick-edit-feed-mask-prefer.component';

describe('QuickEditFeedMaskPreferComponent', () => {
  let component: QuickEditFeedMaskPreferComponent;
  let fixture: ComponentFixture<QuickEditFeedMaskPreferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickEditFeedMaskPreferComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickEditFeedMaskPreferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
