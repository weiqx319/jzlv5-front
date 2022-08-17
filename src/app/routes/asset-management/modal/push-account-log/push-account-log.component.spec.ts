import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PushAccountLogComponent } from './push-account-log.component';

describe('PushAccountLogComponent', () => {
  let component: PushAccountLogComponent;
  let fixture: ComponentFixture<PushAccountLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PushAccountLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PushAccountLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
