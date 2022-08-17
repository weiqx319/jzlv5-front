import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PushAccountComponent } from './push-account.component';

describe('PushAccountComponent', () => {
  let component: PushAccountComponent;
  let fixture: ComponentFixture<PushAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PushAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PushAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
