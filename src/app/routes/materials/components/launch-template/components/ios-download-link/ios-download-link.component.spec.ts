import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IosDownloadLinkComponent } from './ios-download-link.component';

describe('IosDownloadLinkComponent', () => {
  let component: IosDownloadLinkComponent;
  let fixture: ComponentFixture<IosDownloadLinkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IosDownloadLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IosDownloadLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
