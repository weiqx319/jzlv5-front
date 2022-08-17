import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditGroupTargetComponent } from './edit-group-target.component';

describe('EditGroupTargetSingleBdComponent', () => {
  let component: EditGroupTargetComponent;
  let fixture: ComponentFixture<EditGroupTargetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditGroupTargetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGroupTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
