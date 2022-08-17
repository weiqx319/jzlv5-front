import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditCreativeBatchComponent } from './edit-creative-batch.component';

describe('EditCreativeBatchComponent', () => {
  let component: EditCreativeBatchComponent;
  let fixture: ComponentFixture<EditCreativeBatchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCreativeBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCreativeBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
