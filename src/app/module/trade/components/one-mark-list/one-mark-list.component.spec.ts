import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OneMarkListComponent } from './one-mark-list.component';

describe('OneMarkListComponent', () => {
  let component: OneMarkListComponent;
  let fixture: ComponentFixture<OneMarkListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OneMarkListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneMarkListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
