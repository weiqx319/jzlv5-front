import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationTacticListComponent } from './automation-tactic-list.component';

describe('AutomationTacticListComponent', () => {
  let component: AutomationTacticListComponent;
  let fixture: ComponentFixture<AutomationTacticListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AutomationTacticListComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationTacticListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
