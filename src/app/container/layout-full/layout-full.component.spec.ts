import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LayoutFullComponent } from './layout-full.component';

describe('LayoutFullComponent', () => {
  let component: LayoutFullComponent;
  let fixture: ComponentFixture<LayoutFullComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutFullComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
