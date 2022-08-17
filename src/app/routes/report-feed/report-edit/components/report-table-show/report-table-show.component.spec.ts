import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportTableShowComponent } from './report-table-show.component';

describe('ReportTableShowComponent', () => {
  let component: ReportTableShowComponent;
  let fixture: ComponentFixture<ReportTableShowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportTableShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportTableShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
