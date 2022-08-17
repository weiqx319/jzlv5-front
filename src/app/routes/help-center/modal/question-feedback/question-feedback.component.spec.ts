import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuestionFeedbackComponent } from './question-feedback.component';

describe('QuestionFeedbackComponent', () => {
  let component: QuestionFeedbackComponent;
  let fixture: ComponentFixture<QuestionFeedbackComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
