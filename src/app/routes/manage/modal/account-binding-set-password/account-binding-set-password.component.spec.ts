import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccountBindingSetPasswordComponent } from './account-binding-set-password.component';

describe('AccountBindingSetPasswordComponent', () => {
  let component: AccountBindingSetPasswordComponent;
  let fixture: ComponentFixture<AccountBindingSetPasswordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountBindingSetPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBindingSetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
