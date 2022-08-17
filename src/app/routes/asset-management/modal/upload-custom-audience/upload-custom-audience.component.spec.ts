import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadCustomAudienceComponent } from './upload-custom-audience.component';

describe('UploadCustomAudienceComponent', () => {
  let component: UploadCustomAudienceComponent;
  let fixture: ComponentFixture<UploadCustomAudienceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadCustomAudienceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadCustomAudienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
