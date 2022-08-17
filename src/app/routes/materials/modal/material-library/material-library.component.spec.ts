import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MaterialLibraryComponent } from './material-library.component';

describe('MaterialLibraryComponent', () => {
  let component: MaterialLibraryComponent;
  let fixture: ComponentFixture<MaterialLibraryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
