import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateLaunchComponent } from './create-launch.component';

describe('CreateLaunchComponent', () => {
  let component: CreateLaunchComponent;
  let fixture: ComponentFixture<CreateLaunchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLaunchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLaunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
