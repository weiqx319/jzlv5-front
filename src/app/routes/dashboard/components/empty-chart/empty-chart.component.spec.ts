import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EmptyChartComponent } from './empty-chart.component';

describe('EmptyChartComponent', () => {
  let component: EmptyChartComponent;
  let fixture: ComponentFixture<EmptyChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EmptyChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptyChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
