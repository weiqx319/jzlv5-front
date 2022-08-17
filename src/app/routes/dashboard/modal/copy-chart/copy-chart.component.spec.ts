import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CopyChartComponent } from './copy-chart.component';

describe('CopyChartComponent', () => {
  let component: CopyChartComponent;
  let fixture: ComponentFixture<CopyChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
