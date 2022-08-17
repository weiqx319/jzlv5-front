import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from "../../shared/shared.module";
import {ViewBatchUploadComponent} from './components/view-batch-upload/view-batch-upload.component';
import {HotTableModule} from '@jzl/hot-table6';
import {BatchUploadService} from './service/batch-upload.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    HotTableModule,
  ],
  exports:[
    ViewBatchUploadComponent
  ],
  declarations:[
    ViewBatchUploadComponent,
  ],
  entryComponents:[
    ViewBatchUploadComponent
  ],
  providers:[
    BatchUploadService
  ]

})
export class BatchUploadModule { }
