import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAnalyticsTableComponent } from './data-analytics-table.component';

describe('DataAnalyticsTableComponent', () => {
  let component: DataAnalyticsTableComponent;
  let fixture: ComponentFixture<DataAnalyticsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataAnalyticsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataAnalyticsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
