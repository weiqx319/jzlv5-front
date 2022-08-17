import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddDimensionComponent } from './add-dimension.component';

describe('AddDimensionComponent', () => {
  let component: AddDimensionComponent;
  let fixture: ComponentFixture<AddDimensionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDimensionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDimensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
