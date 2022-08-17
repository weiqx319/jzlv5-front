import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { JzlChartComponent } from './jzl-chart.component';

describe('JzlChartComponent', () => {
  let component: JzlChartComponent;
  let fixture: ComponentFixture<JzlChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ JzlChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JzlChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
