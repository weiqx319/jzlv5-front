import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBindingDetailComponent } from './account-binding-detail.component';

describe('AccountBindingDetailComponent', () => {
  let component: AccountBindingDetailComponent;
  let fixture: ComponentFixture<AccountBindingDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountBindingDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBindingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
