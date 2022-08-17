import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddConversionDataComponent } from './add-conversion-data.component';

describe('AddConversionDataComponent', () => {
  let component: AddConversionDataComponent;
  let fixture: ComponentFixture<AddConversionDataComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddConversionDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddConversionDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
