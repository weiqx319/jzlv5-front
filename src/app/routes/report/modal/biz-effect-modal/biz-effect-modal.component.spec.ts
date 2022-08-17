import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BizEffectModalComponent } from './biz-effect-modal.component';

describe('BizEffectModalComponent', () => {
  let component: BizEffectModalComponent;
  let fixture: ComponentFixture<BizEffectModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BizEffectModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BizEffectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
