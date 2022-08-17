import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PublisherSelectComponent } from './publisher-select.component';

describe('PublisherSelectComponent', () => {
  let component: PublisherSelectComponent;
  let fixture: ComponentFixture<PublisherSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PublisherSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublisherSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
