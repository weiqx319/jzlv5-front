import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadConversionComponent } from './upload-conversion.component';

describe('UploadConversionComponent', () => {
  let component: UploadConversionComponent;
  let fixture: ComponentFixture<UploadConversionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadConversionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadConversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
