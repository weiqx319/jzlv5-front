import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BizTableModalComponent } from './biz-table-modal.component';

describe('BizTableModalComponent', () => {
  let component: BizTableModalComponent;
  let fixture: ComponentFixture<BizTableModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BizTableModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BizTableModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
