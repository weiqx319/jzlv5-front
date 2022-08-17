import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccountBindingMultiChannelComponent } from './account-binding-multi-channel.component';

describe('AccountBindingMultiChannelComponent', () => {
  let component: AccountBindingMultiChannelComponent;
  let fixture: ComponentFixture<AccountBindingMultiChannelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountBindingMultiChannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBindingMultiChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
