import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetRulesComponent } from './set-rules.component';

describe('SetRulesComponent', () => {
  let component: SetRulesComponent;
  let fixture: ComponentFixture<SetRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetRulesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
