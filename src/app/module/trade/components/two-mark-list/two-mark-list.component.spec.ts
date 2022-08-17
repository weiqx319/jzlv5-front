import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TwoMarkListComponent } from './two-mark-list.component';

describe('TwoMarkListComponent', () => {
  let component: TwoMarkListComponent;
  let fixture: ComponentFixture<TwoMarkListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TwoMarkListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoMarkListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
