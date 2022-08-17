import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LaunchTemplateComponent } from './launch-template.component';

describe('LaunchTemplateComponent', () => {
  let component: LaunchTemplateComponent;
  let fixture: ComponentFixture<LaunchTemplateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LaunchTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
