import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewBatchUploadComponent } from './view-batch-upload.component';

describe('ViewBatchUploadComponent', () => {
  let component: ViewBatchUploadComponent;
  let fixture: ComponentFixture<ViewBatchUploadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewBatchUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBatchUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
