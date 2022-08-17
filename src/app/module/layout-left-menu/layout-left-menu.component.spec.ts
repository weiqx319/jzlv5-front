import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutLeftMenuComponent } from './layout-left-menu.component';

describe('LayoutLeftMenuComponent', () => {
  let component: LayoutLeftMenuComponent;
  let fixture: ComponentFixture<LayoutLeftMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayoutLeftMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutLeftMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
