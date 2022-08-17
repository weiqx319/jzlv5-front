import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditKeywordSingleModalComponent } from './edit-keyword-single-modal.component';

describe('EditKeywordSingleModalComponent', () => {
  let component: EditKeywordSingleModalComponent;
  let fixture: ComponentFixture<EditKeywordSingleModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditKeywordSingleModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditKeywordSingleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
