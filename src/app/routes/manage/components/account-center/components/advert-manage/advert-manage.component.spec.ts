import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdvertManageComponent } from './advert-manage.component';

describe('AdvertManageComponent', () => {
  let component: AdvertManageComponent;
  let fixture: ComponentFixture<AdvertManageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvertManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvertManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
