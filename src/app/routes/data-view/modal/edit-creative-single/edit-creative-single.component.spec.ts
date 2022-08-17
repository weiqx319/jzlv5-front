import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditCreativeSingleComponent } from './edit-creative-single.component';

describe('EditCreativeSingleComponent', () => {
  let component: EditCreativeSingleComponent;
  let fixture: ComponentFixture<EditCreativeSingleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCreativeSingleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCreativeSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
