import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccountBindingUploadCompensateComponent } from './account-binding-upload-compensate.component';

describe('AccountBindingUploadCompensateComponent', () => {
  let component: AccountBindingUploadCompensateComponent;
  let fixture: ComponentFixture<AccountBindingUploadCompensateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountBindingUploadCompensateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBindingUploadCompensateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
