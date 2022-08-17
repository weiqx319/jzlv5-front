import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationTacticDetailComponent } from './automation-tactic-detail.component';

describe('AutomationTacticDetailComponent', () => {
  let component: AutomationTacticDetailComponent;
  let fixture: ComponentFixture<AutomationTacticDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AutomationTacticDetailComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationTacticDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
