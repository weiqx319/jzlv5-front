import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddNegativeWordGroupComponent } from './add-negative-word-group.component';

describe('AddNegativeWordGroupComponent', () => {
  let component: AddNegativeWordGroupComponent;
  let fixture: ComponentFixture<AddNegativeWordGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNegativeWordGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNegativeWordGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
