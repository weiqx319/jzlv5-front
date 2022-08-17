import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddCompanyAccountDimensionComponent } from './add-company-account-dimension.component';

describe('AddCompanyAccountDimensionComponent', () => {
  let component: AddCompanyAccountDimensionComponent;
  let fixture: ComponentFixture<AddCompanyAccountDimensionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddCompanyAccountDimensionComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCompanyAccountDimensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
