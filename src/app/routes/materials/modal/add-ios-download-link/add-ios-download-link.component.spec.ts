import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddIosDownloadLinkComponent } from './add-ios-download-link.component';

describe('AddIosDownloadLinkComponent', () => {
  let component: AddIosDownloadLinkComponent;
  let fixture: ComponentFixture<AddIosDownloadLinkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddIosDownloadLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddIosDownloadLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
