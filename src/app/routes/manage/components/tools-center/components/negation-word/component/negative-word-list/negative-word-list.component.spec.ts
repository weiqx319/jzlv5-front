import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NegativeWordListComponent } from './negative-word-list.component';

describe('NegativeWordListComponent', () => {
  let component: NegativeWordListComponent;
  let fixture: ComponentFixture<NegativeWordListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NegativeWordListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NegativeWordListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
