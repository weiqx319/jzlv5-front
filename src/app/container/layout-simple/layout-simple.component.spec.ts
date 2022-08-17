import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LayoutSimpleComponent } from './layout-simple.component';

describe('LayoutSimpleComponent', () => {
  let component: LayoutSimpleComponent;
  let fixture: ComponentFixture<LayoutSimpleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutSimpleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
