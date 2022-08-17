import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetAutomationTacticComponent } from './set-tactic-detail.component';

describe('SetAutomationTacticComponent', () => {
  let component: SetAutomationTacticComponent;
  let fixture: ComponentFixture<SetAutomationTacticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SetAutomationTacticComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetAutomationTacticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
