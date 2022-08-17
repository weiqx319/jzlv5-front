import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccountBindingChannelNoAccountComponent } from './account-binding-channel-no-account.component';

describe('AccountBindingChannelNoAccountComponent', () => {
  let component: AccountBindingChannelNoAccountComponent;
  let fixture: ComponentFixture<AccountBindingChannelNoAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountBindingChannelNoAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBindingChannelNoAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
