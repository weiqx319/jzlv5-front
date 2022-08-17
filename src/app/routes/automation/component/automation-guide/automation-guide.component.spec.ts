import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationGuideComponent } from './automation-guide.component';

describe('AutomationGuideComponent', () => {
  let component: AutomationGuideComponent;
  let fixture: ComponentFixture<AutomationGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationGuideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
