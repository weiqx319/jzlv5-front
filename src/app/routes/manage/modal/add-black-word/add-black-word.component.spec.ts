import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddBlackWordComponent } from './add-black-word.component';

describe('AddBlackWordComponent', () => {
  let component: AddBlackWordComponent;
  let fixture: ComponentFixture<AddBlackWordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBlackWordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBlackWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
