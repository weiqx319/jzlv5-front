import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BlackWordListComponent } from './black-word-list.component';

describe('BlackWordListComponent', () => {
  let component: BlackWordListComponent;
  let fixture: ComponentFixture<BlackWordListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BlackWordListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlackWordListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
