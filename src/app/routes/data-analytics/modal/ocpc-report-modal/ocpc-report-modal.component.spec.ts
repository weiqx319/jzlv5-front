import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OcpcReportModalComponent } from './ocpc-report-modal.component';

describe('OcpcReportModalComponent', () => {
  let component: OcpcReportModalComponent;
  let fixture: ComponentFixture<OcpcReportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OcpcReportModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OcpcReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
