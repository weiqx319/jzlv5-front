import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RegionSelectComponent } from './region-select.component';

describe('DateSelectViewComponent', () => {
  let component: RegionSelectComponent;
  let fixture: ComponentFixture<RegionSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RegionSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
