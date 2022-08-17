import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddMeticCategoryComponent } from './add-metic-category.component';

describe('AddMeticCategoryComponent', () => {
  let component: AddMeticCategoryComponent;
  let fixture: ComponentFixture<AddMeticCategoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMeticCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMeticCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
