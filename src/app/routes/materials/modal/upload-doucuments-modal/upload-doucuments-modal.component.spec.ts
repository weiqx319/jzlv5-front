import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadDoucumentsModalComponent } from './upload-doucuments-modal.component';

describe('UploadDoucumentsModalComponent', () => {
  let component: UploadDoucumentsModalComponent;
  let fixture: ComponentFixture<UploadDoucumentsModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadDoucumentsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadDoucumentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
