import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BizRegionModalComponent } from './biz-region-modal.component';

describe('BizRegionModalComponent', () => {
  let component: BizRegionModalComponent;
  let fixture: ComponentFixture<BizRegionModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BizRegionModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BizRegionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
