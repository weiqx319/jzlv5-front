import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddMetricDataComponent } from './add-metric-data.component';

describe('AddMetricDataComponent', () => {
  let component: AddMetricDataComponent;
  let fixture: ComponentFixture<AddMetricDataComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMetricDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMetricDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
