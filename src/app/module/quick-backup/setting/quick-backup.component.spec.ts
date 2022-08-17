import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickBackupComponent } from './quick-backup.component';

describe('QuickEditComponent', () => {
  let component: QuickBackupComponent;
  let fixture: ComponentFixture<QuickBackupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickBackupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
