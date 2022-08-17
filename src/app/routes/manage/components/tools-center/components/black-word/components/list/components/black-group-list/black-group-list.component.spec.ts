import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BlackGroupListComponent } from './black-group-list.component';

describe('BlackGroupListComponent', () => {
  let component: BlackGroupListComponent;
  let fixture: ComponentFixture<BlackGroupListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BlackGroupListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlackGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
