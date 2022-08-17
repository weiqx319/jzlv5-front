import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddDocumentGroupManageComponent } from './add-document-group-manage.component';

describe('AddDocumentGroupManageComponent', () => {
  let component: AddDocumentGroupManageComponent;
  let fixture: ComponentFixture<AddDocumentGroupManageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDocumentGroupManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDocumentGroupManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
