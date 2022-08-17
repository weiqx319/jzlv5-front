import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from "../../shared/shared.module";
import {ViewBookmarkComponent} from "./components/view-bookmark.component";
import {BookmarkService} from "./service/bookmark.service";
import {AppBookmarkModalComponent} from "./modal/app-bookmark-modal.component";
import {AppBookmarkSaveModalComponent} from "./modal/app-bookmark-save-modal/app-bookmark-save-modal.component";




@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    ViewBookmarkComponent, AppBookmarkModalComponent
  ],
  declarations: [ViewBookmarkComponent, AppBookmarkModalComponent, AppBookmarkSaveModalComponent],
  providers: [ BookmarkService ],
  entryComponents: [AppBookmarkModalComponent, AppBookmarkSaveModalComponent],
})
export class BookmarkModule { }
