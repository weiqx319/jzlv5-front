import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LayoutOauthComponent } from './layout-oauth.component';

describe('LayoutOauthComponent', () => {
  let component: LayoutOauthComponent;
  let fixture: ComponentFixture<LayoutOauthComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutOauthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutOauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
