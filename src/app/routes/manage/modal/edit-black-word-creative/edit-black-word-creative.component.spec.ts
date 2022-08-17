import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditBlackWordCreativeComponent } from './edit-black-word-creative.component';

describe('EditBlackWordCreativeComponent', () => {
  let component: EditBlackWordCreativeComponent;
  let fixture: ComponentFixture<EditBlackWordCreativeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBlackWordCreativeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBlackWordCreativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
