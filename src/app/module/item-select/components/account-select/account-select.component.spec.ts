import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccountSelectComponent } from './account-select.component';

describe('AccountSelectComponent', () => {
  let component: AccountSelectComponent;
  let fixture: ComponentFixture<AccountSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
