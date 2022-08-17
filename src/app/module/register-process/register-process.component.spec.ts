import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RegisterProcessComponent } from './register-process.component';

describe('RegisterProcessComponent', () => {
  let component: RegisterProcessComponent;
  let fixture: ComponentFixture<RegisterProcessComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
