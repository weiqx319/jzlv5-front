import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddDocumentGroupComponent } from './add-document-group.component';

describe('AddDocumentGroupComponent', () => {
  let component: AddDocumentGroupComponent;
  let fixture: ComponentFixture<AddDocumentGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDocumentGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDocumentGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
