import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BlackListComponent } from './black-list.component';

describe('BlackListComponent', () => {
  let component: BlackListComponent;
  let fixture: ComponentFixture<BlackListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BlackListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlackListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
