import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddMaterialsAuthorComponent } from './add-materials-author.component';

describe('AddMaterialsAuthorComponent', () => {
  let component: AddMaterialsAuthorComponent;
  let fixture: ComponentFixture<AddMaterialsAuthorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMaterialsAuthorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMaterialsAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
