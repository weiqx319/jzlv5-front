import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddAndroidDownloadLinkComponent } from './add-android-download-link.component';

describe('AddAndroidDownloadLinkComponent', () => {
  let component: AddAndroidDownloadLinkComponent;
  let fixture: ComponentFixture<AddAndroidDownloadLinkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAndroidDownloadLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAndroidDownloadLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
