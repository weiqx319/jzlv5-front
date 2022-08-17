import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LaunchGroupDetailToutiaoComponent } from './launch-group-detail-toutiao.component';

describe('LaunchGroupDetailToutiaoComponent', () => {
  let component: LaunchGroupDetailToutiaoComponent;
  let fixture: ComponentFixture<LaunchGroupDetailToutiaoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LaunchGroupDetailToutiaoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchGroupDetailToutiaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
