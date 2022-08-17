import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncCustomAudienceComponent } from './sync-custom-audience.component';

describe('SyncCustomAudienceComponent', () => {
  let component: SyncCustomAudienceComponent;
  let fixture: ComponentFixture<SyncCustomAudienceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SyncCustomAudienceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncCustomAudienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
