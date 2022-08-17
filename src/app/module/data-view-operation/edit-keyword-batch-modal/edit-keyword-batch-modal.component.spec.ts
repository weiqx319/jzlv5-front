import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditKeywordBatchModalComponent } from './edit-keyword-batch-modal.component';

describe('EditKeywordBatchModalComponent', () => {
  let component: EditKeywordBatchModalComponent;
  let fixture: ComponentFixture<EditKeywordBatchModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditKeywordBatchModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditKeywordBatchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
