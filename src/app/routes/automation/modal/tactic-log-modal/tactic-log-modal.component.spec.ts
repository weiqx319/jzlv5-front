import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TacticLogModalComponent } from './tactic-log-modal.component';

describe('TacticLogModalComponent', () => {
  let component: TacticLogModalComponent;
  let fixture: ComponentFixture<TacticLogModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TacticLogModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TacticLogModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
