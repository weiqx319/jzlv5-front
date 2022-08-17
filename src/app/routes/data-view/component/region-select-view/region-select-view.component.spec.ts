import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RegionSelectViewComponent } from './region-select-view.component';

describe('DateSelectViewComponent', () => {
  let component: RegionSelectViewComponent;
  let fixture: ComponentFixture<RegionSelectViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RegionSelectViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionSelectViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
