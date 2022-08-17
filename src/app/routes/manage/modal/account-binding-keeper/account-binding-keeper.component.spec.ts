import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccountBindingKeeperComponent } from './account-binding-keeper.component';

describe('AccountBindingKeeperComponent', () => {
  let component: AccountBindingKeeperComponent;
  let fixture: ComponentFixture<AccountBindingKeeperComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountBindingKeeperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBindingKeeperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
