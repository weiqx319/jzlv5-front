import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CompanyAccountDimensionComponent } from './company-account-dimension.component';

describe('CompanyAccountDimensionComponent', () => {
  let component: CompanyAccountDimensionComponent;
  let fixture: ComponentFixture<CompanyAccountDimensionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CompanyAccountDimensionComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyAccountDimensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
