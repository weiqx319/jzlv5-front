import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditMessageComponent } from './edit-message.component';

describe('EditMessageComponent', () => {
  let component: EditMessageComponent;
  let fixture: ComponentFixture<EditMessageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
