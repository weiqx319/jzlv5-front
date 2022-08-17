import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditExtensionComponent } from './edit-extension.component';

describe('EditExtensionComponent', () => {
  let component: EditExtensionComponent;
  let fixture: ComponentFixture<EditExtensionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditExtensionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
