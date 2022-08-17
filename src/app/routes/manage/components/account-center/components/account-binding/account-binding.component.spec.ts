import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {PauseSettingComponent} from "../../../../../optimization/modal/pause-setting/pause-setting.component";

describe('PauseSettingComponent', () => {
  let component: PauseSettingComponent;
  let fixture: ComponentFixture<PauseSettingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PauseSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PauseSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
