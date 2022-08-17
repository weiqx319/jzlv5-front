import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageTipComponent } from './manage-tip.component';

describe('ManageTipComponent', () => {
  let component: ManageTipComponent;
  let fixture: ComponentFixture<ManageTipComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
