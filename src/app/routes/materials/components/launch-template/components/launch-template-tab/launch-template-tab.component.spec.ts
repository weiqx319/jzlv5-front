import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LaunchTemplateTabComponent } from './launch-template-tab.component';

describe('LaunchTemplateTabComponent', () => {
  let component: LaunchTemplateTabComponent;
  let fixture: ComponentFixture<LaunchTemplateTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LaunchTemplateTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchTemplateTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
