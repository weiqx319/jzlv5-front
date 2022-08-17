import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResponsibleReportComponent } from './responsible-report.component';

describe('ResponsibleReportComponent', () => {
  let component: ResponsibleReportComponent;
  let fixture: ComponentFixture<ResponsibleReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResponsibleReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsibleReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
