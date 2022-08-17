import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BlackWordComponent } from './black-word.component';

describe('BlackWordComponent', () => {
  let component: BlackWordComponent;
  let fixture: ComponentFixture<BlackWordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BlackWordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlackWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
