import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlackWordLogListComponent } from './black-word-log-list.component';

describe('BlackWordLogListComponent', () => {
  let component: BlackWordLogListComponent;
  let fixture: ComponentFixture<BlackWordLogListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlackWordLogListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlackWordLogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
