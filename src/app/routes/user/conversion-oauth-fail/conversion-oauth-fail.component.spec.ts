import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConversionOauthFailComponent } from './conversion-oauth-fail.component';

describe('ConversionOauthFailComponent', () => {
  let component: ConversionOauthFailComponent;
  let fixture: ComponentFixture<ConversionOauthFailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversionOauthFailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversionOauthFailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
