import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditFolderNameComponent } from './edit-folder-name.component';

describe('EditOptimizationNameComponent', () => {
  let component: EditFolderNameComponent;
  let fixture: ComponentFixture<EditFolderNameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditFolderNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFolderNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
