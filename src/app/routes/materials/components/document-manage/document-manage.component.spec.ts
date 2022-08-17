import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DocumentManageComponent } from './document-manage.component';

describe('DocumentManageComponent', () => {
  let component: DocumentManageComponent;
  let fixture: ComponentFixture<DocumentManageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
