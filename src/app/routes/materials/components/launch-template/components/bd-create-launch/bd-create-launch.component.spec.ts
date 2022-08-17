import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BdCreateLaunchComponent } from './bd-create-launch.component';

describe('BdCreateLaunchComponent', () => {
  let component: BdCreateLaunchComponent;
  let fixture: ComponentFixture<BdCreateLaunchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BdCreateLaunchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BdCreateLaunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
