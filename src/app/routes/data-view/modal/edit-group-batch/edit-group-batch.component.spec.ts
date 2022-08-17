import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditGroupBatchComponent } from './edit-group-batch.component';

describe('EditGroupBatchComponent', () => {
  let component: EditGroupBatchComponent;
  let fixture: ComponentFixture<EditGroupBatchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditGroupBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGroupBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
