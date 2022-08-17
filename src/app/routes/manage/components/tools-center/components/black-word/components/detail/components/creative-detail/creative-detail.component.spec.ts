import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreativeDetailComponent } from './creative-detail.component';

describe('CreativeDetailComponent', () => {
  let component: CreativeDetailComponent;
  let fixture: ComponentFixture<CreativeDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreativeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreativeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
