import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataViewFeedLayoutComponent } from './data-view-feed-layout.component';

describe('DataViewFeedLayoutComponent', () => {
  let component: DataViewFeedLayoutComponent;
  let fixture: ComponentFixture<DataViewFeedLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataViewFeedLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataViewFeedLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
