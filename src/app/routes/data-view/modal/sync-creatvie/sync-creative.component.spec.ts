import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SyncCreativeComponent } from './sync-creative.component';

describe('SyncCreativeComponent', () => {
  let component: SyncCreativeComponent;
  let fixture: ComponentFixture<SyncCreativeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncCreativeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncCreativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
