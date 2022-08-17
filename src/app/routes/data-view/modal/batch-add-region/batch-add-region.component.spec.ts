import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchAddRegionComponent } from './batch-add-region.component';

describe('BatchAddRegionComponent', () => {
  let component: BatchAddRegionComponent;
  let fixture: ComponentFixture<BatchAddRegionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BatchAddRegionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchAddRegionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
