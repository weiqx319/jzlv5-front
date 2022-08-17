import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FolderListWrapComponent } from './folder-list-wrap.component';

describe('OptimizationListComponent', () => {
  let component: FolderListWrapComponent;
  let fixture: ComponentFixture<FolderListWrapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderListWrapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderListWrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
