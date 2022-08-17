import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddNegativeWordComponent } from './add-negative-word.component';

describe('AddNegativeWordComponent', () => {
  let component: AddNegativeWordComponent;
  let fixture: ComponentFixture<AddNegativeWordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNegativeWordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNegativeWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
