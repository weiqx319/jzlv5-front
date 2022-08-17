import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccountBindingModalComponent } from './account-binding-modal.component';

describe('AccountBindingModalComponent', () => {
  let component: AccountBindingModalComponent;
  let fixture: ComponentFixture<AccountBindingModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountBindingModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBindingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
