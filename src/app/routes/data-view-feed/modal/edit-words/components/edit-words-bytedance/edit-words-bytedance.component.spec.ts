import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditWordsBytedanceComponent } from './edit-words-bytedance.component';

describe('EditWordsBytedanceComponent', () => {
  let component: EditWordsBytedanceComponent;
  let fixture: ComponentFixture<EditWordsBytedanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditWordsBytedanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditWordsBytedanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
