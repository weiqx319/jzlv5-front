import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LayoutRegisterComponent } from './layout-register.component';

describe('LayoutRegisterComponent', () => {
  let component: LayoutRegisterComponent;
  let fixture: ComponentFixture<LayoutRegisterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutRegisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
