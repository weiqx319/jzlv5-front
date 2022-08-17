import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LayoutGuardComponent } from './layout-guard.component';

describe('LayoutGuardComponent', () => {
  let component: LayoutGuardComponent;
  let fixture: ComponentFixture<LayoutGuardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutGuardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutGuardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
