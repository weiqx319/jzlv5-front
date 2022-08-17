import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MsgDetailComponent } from './msg-detail.component';

describe('MsgDetailComponent', () => {
  let component: MsgDetailComponent;
  let fixture: ComponentFixture<MsgDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MsgDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsgDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
