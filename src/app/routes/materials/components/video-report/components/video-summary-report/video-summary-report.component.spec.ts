import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VideoSummaryReportComponent } from './video-summary-report.component';

describe('VideoSummaryReportComponent', () => {
  let component: VideoSummaryReportComponent;
  let fixture: ComponentFixture<VideoSummaryReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoSummaryReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
