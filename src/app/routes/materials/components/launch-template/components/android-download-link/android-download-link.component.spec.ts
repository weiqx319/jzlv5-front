import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AndroidDownloadLinkComponent } from './android-download-link.component';

describe('AndroidDownloadLinkComponent', () => {
  let component: AndroidDownloadLinkComponent;
  let fixture: ComponentFixture<AndroidDownloadLinkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AndroidDownloadLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AndroidDownloadLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
