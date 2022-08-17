import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickEditKeywordMatchTypeComponent } from './quick-edit-keyword-match-type.component';

describe('QuickEditKeywordMatchTypeComponent', () => {
  let component: QuickEditKeywordMatchTypeComponent;
  let fixture: ComponentFixture<QuickEditKeywordMatchTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickEditKeywordMatchTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickEditKeywordMatchTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
