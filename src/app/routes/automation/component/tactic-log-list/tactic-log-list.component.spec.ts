import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TacticLogListComponent } from './tactic-log-list.component';

describe('TacticLogListComponent', () => {
  let component: TacticLogListComponent;
  let fixture: ComponentFixture<TacticLogListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TacticLogListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TacticLogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
