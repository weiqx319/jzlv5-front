import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversionSettingComponent } from './conversion-setting.component';

describe('ConversionSettingComponent', () => {
  let component: ConversionSettingComponent;
  let fixture: ComponentFixture<ConversionSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConversionSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversionSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
