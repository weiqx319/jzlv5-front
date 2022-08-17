import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TransferTreeComponent } from './transfer-tree.component';

describe('TransferTreeComponent', () => {
  let component: TransferTreeComponent;
  let fixture: ComponentFixture<TransferTreeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
