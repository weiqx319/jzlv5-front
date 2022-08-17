import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BlackDetailComponent } from './black-detail.component';

describe('BlackDetailComponent', () => {
  let component: BlackDetailComponent;
  let fixture: ComponentFixture<BlackDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BlackDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlackDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
