import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccountBindingKeeperChildComponent } from './account-binding-keeper-child.component';

describe('AccountBindingKeeperChildComponent', () => {
  let component: AccountBindingKeeperChildComponent;
  let fixture: ComponentFixture<AccountBindingKeeperChildComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountBindingKeeperChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBindingKeeperChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
