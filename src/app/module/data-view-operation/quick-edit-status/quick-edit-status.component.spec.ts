import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickEditStatusComponent } from './quick-edit-status.component';

describe('QuickEditStatusComponent', () => {
  let component: QuickEditStatusComponent;
  let fixture: ComponentFixture<QuickEditStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickEditStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickEditStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
