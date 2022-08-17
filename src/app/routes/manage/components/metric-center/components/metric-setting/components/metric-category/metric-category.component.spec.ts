import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MetricCategoryComponent } from './metric-category.component';

describe('MetricCategoryComponent', () => {
  let component: MetricCategoryComponent;
  let fixture: ComponentFixture<MetricCategoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MetricCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
