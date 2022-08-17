import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddViewDimensionComponent } from './add-view-dimension.component';

describe('AddViewDimensionComponent', () => {
  let component: AddViewDimensionComponent;
  let fixture: ComponentFixture<AddViewDimensionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddViewDimensionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddViewDimensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
