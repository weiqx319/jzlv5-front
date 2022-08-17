import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditGroupTargetSingleBdComponent } from './edit-group-target-single-bd.component';

describe('EditGroupTargetSingleBdComponent', () => {
  let component: EditGroupTargetSingleBdComponent;
  let fixture: ComponentFixture<EditGroupTargetSingleBdComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditGroupTargetSingleBdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGroupTargetSingleBdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
