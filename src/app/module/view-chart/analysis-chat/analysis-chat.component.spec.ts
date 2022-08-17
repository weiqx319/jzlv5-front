import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisChatComponent } from './analysis-chat.component';

describe('AnalysisChatComponent', () => {
  let component: AnalysisChatComponent;
  let fixture: ComponentFixture<AnalysisChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalysisChatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalysisChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
