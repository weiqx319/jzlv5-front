import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BlackWordLogComponent } from './black-word-log.component';

describe('BlackWordLogComponent', () => {
  let component: BlackWordLogComponent;
  let fixture: ComponentFixture<BlackWordLogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BlackWordLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlackWordLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
