import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataViewLayoutComponent } from './data-view-layout.component';

describe('DataViewLayoutComponent', () => {
  let component: DataViewLayoutComponent;
  let fixture: ComponentFixture<DataViewLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataViewLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataViewLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
