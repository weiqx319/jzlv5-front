import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MsgCenterComponent } from './msg-center.component';

describe('MsgCenterComponent', () => {
  let component: MsgCenterComponent;
  let fixture: ComponentFixture<MsgCenterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MsgCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsgCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
