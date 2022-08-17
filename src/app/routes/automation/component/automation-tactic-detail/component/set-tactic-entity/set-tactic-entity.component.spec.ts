import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetTacticEntityComponent } from './set-tactic-entity.component';

describe('SetTacticEntityComponent', () => {
  let component: SetTacticEntityComponent;
  let fixture: ComponentFixture<SetTacticEntityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SetTacticEntityComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetTacticEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
