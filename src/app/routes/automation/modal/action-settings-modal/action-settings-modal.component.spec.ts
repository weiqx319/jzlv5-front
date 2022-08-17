import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionSettingsModalComponent } from './action-settings-modal.component';

describe('ActionSettingsModalComponent', () => {
  let component: ActionSettingsModalComponent;
  let fixture: ComponentFixture<ActionSettingsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionSettingsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
