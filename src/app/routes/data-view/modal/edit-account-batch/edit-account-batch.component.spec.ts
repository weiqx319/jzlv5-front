import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditAccountBatchComponent } from './edit-account-batch.component';

describe('EditAccountBatchComponent', () => {
  let component: EditAccountBatchComponent;
  let fixture: ComponentFixture<EditAccountBatchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAccountBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAccountBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
