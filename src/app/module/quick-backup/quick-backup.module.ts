import { NgModule } from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {QuickBackupComponent} from './setting/quick-backup.component';
import {BackupListComponent} from './list/backup-list.component';

@NgModule({
  imports: [
    SharedModule
  ],
  exports: [QuickBackupComponent, BackupListComponent],
  declarations: [QuickBackupComponent, BackupListComponent],
  entryComponents: [QuickBackupComponent, BackupListComponent]
})
export class QuickBackupModule { }
