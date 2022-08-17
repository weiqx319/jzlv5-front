import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NegationListComponent } from './negation-list.component';

describe('NegationListComponent', () => {
  let component: NegationListComponent;
  let fixture: ComponentFixture<NegationListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NegationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NegationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
