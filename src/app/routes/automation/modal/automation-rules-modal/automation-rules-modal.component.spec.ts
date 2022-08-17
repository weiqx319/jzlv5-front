import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationRulesModalComponent } from './automation-rules-modal.component';

describe('AutomationRulesModalComponent', () => {
  let component: AutomationRulesModalComponent;
  let fixture: ComponentFixture<AutomationRulesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationRulesModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationRulesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
