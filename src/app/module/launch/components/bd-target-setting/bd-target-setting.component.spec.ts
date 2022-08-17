import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BdTargetSettingComponent } from './bd-target-setting.component';

describe('BdTargetSettingComponent', () => {
  let component: BdTargetSettingComponent;
  let fixture: ComponentFixture<BdTargetSettingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BdTargetSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BdTargetSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
