import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddAuthorMessageComponent } from './add-author-message.component';

describe('AddAuthorMessageComponent', () => {
  let component: AddAuthorMessageComponent;
  let fixture: ComponentFixture<AddAuthorMessageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAuthorMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAuthorMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
