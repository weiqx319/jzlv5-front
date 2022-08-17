import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAnalyticsViewComponent } from './data-analytics-view.component';

describe('DataAnalyticsViewComponent', () => {
  let component: DataAnalyticsViewComponent;
  let fixture: ComponentFixture<DataAnalyticsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataAnalyticsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataAnalyticsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
