import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdvertFormComponent } from './advert-form.component';

describe('AdvertFormComponent', () => {
  let component: AdvertFormComponent;
  let fixture: ComponentFixture<AdvertFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvertFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvertFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
