import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AuthorizationBindingComponent } from './authorization-binding.component';

describe('AuthorizationBindingComponent', () => {
  let component: AuthorizationBindingComponent;
  let fixture: ComponentFixture<AuthorizationBindingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorizationBindingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorizationBindingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
