import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickEditComponent } from './quick-edit.component';

describe('QuickEditComponent', () => {
  let component: QuickEditComponent;
  let fixture: ComponentFixture<QuickEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
