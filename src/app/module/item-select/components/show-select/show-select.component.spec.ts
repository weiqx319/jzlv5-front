import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShowSelectComponent } from './show-select.component';

describe('ShowSelectComponent', () => {
  let component: ShowSelectComponent;
  let fixture: ComponentFixture<ShowSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
