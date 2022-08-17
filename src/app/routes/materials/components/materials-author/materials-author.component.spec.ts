import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MaterialsAuthorComponent } from './materials-author.component';

describe('MaterialsAuthorComponent', () => {
  let component: MaterialsAuthorComponent;
  let fixture: ComponentFixture<MaterialsAuthorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialsAuthorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialsAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
