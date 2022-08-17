import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HeaderNotifyComponent } from './header-notify.component';

describe('HeaderNotifyComponent', () => {
  let component: HeaderNotifyComponent;
  let fixture: ComponentFixture<HeaderNotifyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderNotifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderNotifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
