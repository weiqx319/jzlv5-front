import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DataViewEditComponent } from './data-view-edit.component';

describe('DataViewEditComponent', () => {
  let component: DataViewEditComponent;
  let fixture: ComponentFixture<DataViewEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DataViewEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataViewEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
