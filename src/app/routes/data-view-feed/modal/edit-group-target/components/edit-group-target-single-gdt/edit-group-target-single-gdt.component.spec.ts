import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditGroupTargetSingleGdtComponent } from './edit-group-target-single-gdt.component';

describe('EditGroupTargetSingleBdComponent', () => {
  let component: EditGroupTargetSingleGdtComponent;
  let fixture: ComponentFixture<EditGroupTargetSingleGdtComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditGroupTargetSingleGdtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGroupTargetSingleGdtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
