import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NegationWordComponent } from './negation-word.component';

describe('NegationWordComponent', () => {
  let component: NegationWordComponent;
  let fixture: ComponentFixture<NegationWordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NegationWordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NegationWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
