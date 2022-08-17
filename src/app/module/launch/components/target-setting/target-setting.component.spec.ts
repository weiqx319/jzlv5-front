import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TargetSettingComponent } from './target-setting.component';

describe('TargetSettingComponent', () => {
  let component: TargetSettingComponent;
  let fixture: ComponentFixture<TargetSettingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
