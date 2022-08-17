import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddExternalUrlComponent } from './add-external-url.component';

describe('AddExternalUrlComponent', () => {
  let component: AddExternalUrlComponent;
  let fixture: ComponentFixture<AddExternalUrlComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddExternalUrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddExternalUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
