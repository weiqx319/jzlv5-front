import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LaunchDocumentComponent } from './launch-document.component';

describe('LaunchDocumentComponent', () => {
  let component: LaunchDocumentComponent;
  let fixture: ComponentFixture<LaunchDocumentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LaunchDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
