import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {BookmarkService} from "../../service/bookmark.service";

@Component({
  selector: 'app-bookmark-save-modal',
  templateUrl: './app-bookmark-save-modal.html',
  styleUrls: ['./app-bookmark-save-modal.scss']
})

export class AppBookmarkSaveModalComponent implements OnInit {


  @Input() summaryType = 'keyword';
  @Input() sheetSetting = {};
  @Input() relationId = '';
  @Input() bookmarkItem: any;

  public submitting = false;

  constructor(private fb: FormBuilder,
              private subject: NzModalRef,
              private _message: NzMessageService,
              private bookmarkService: BookmarkService) {}
  submitForm() {

    this.submitting = true;
    const postResult = {bookmark_id: this.bookmarkItem.bookmark_id, bookmark_name: this.bookmarkItem.bookmark_name, summary_type: this.summaryType, sheets_setting: this.sheetSetting, relation_id: this.relationId};
    this.bookmarkService.updateBookMark(postResult)
            .subscribe(
              response => {
                this.submitting = false;
                if (response.status_code === 200) {
                  this._message.success('保存成功');

                  this.subject.destroy('Ok');

                } else {
                  this._message.error('保存失败,请重试');
                }
              },
              (err) => {
                this.submitting = false;
                this._message.error('保存失败，请重试');
              }
            );
  }

  cancel() {
    this.subject.destroy('onCancel');
  }

  ngOnInit() {

  }
}




