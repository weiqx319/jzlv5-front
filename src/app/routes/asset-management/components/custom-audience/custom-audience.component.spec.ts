import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAudienceComponent } from './custom-audience.component';

describe('CustomAudienceComponent', () => {
  let component: CustomAudienceComponent;
  let fixture: ComponentFixture<CustomAudienceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomAudienceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomAudienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
