import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TacticEntitiesModalComponent } from './tactic-entities-modal.component';

describe('TacticEntitiesModalComponent', () => {
  let component: TacticEntitiesModalComponent;
  let fixture: ComponentFixture<TacticEntitiesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TacticEntitiesModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TacticEntitiesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
