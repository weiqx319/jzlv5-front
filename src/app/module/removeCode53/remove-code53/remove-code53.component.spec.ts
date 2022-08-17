import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RemoveCode53Component } from './remove-code53.component';

describe('RemoveCode53Component', () => {
  let component: RemoveCode53Component;
  let fixture: ComponentFixture<RemoveCode53Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoveCode53Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveCode53Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
