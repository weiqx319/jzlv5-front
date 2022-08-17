import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConversionOauthComponent } from './conversion-oauth.component';

describe('ConversionOauthComponent', () => {
  let component: ConversionOauthComponent;
  let fixture: ComponentFixture<ConversionOauthComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversionOauthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversionOauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
