import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditWordsComponent } from './edit-words.component';

describe('EditWordsComponent', () => {
  let component: EditWordsComponent;
  let fixture: ComponentFixture<EditWordsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditWordsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditWordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
