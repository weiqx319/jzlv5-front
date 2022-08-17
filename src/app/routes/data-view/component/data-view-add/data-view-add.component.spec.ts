import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DataViewAddComponent } from './data-view-add.component';

describe('DataViewAddComponent', () => {
  let component: DataViewAddComponent;
  let fixture: ComponentFixture<DataViewAddComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DataViewAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataViewAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
