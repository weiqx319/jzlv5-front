import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditAccountSingleComponent } from './edit-account-single.component';

describe('EditAccountSingleComponent', () => {
  let component: EditAccountSingleComponent;
  let fixture: ComponentFixture<EditAccountSingleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAccountSingleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAccountSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
