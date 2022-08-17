import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditGroupSingleComponent } from './edit-group-single.component';

describe('EditGroupTargetSingleBdComponent', () => {
  let component: EditGroupSingleComponent;
  let fixture: ComponentFixture<EditGroupSingleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditGroupSingleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGroupSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
