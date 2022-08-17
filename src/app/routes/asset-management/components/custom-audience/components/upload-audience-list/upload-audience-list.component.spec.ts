import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadAudienceListComponent } from './upload-audience-list.component';

describe('UploadAudienceListComponent', () => {
  let component: UploadAudienceListComponent;
  let fixture: ComponentFixture<UploadAudienceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadAudienceListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadAudienceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
