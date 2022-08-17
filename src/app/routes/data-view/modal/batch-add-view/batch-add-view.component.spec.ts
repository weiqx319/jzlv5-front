import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BatchAddViewComponent } from './batch-add-view.component';

describe('BatchAddViewComponent', () => {
  let component: BatchAddViewComponent;
  let fixture: ComponentFixture<BatchAddViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchAddViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchAddViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
