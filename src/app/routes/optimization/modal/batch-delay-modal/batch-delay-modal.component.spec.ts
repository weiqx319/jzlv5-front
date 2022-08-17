import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BatchDelayModalComponent } from './batch-delay-modal.component';

describe('BatchDelayModalComponent', () => {
  let component: BatchDelayModalComponent;
  let fixture: ComponentFixture<BatchDelayModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchDelayModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchDelayModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
