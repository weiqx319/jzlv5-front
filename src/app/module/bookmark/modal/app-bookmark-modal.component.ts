import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {BookmarkService} from "../service/bookmark.service";

@Component({
  selector: 'app-bookmark-modal',
  templateUrl: './app-bookmark-modal.html',
  styleUrls: ['./app-bookmark-modal.scss']
})

export class AppBookmarkModalComponent implements OnInit {
  validateForm: FormGroup;
  _name: string;
  bookmarkId = 0;
  @Input()
  set name(value: string) {
    this._name = value;
  }
  @Input()
  set id(value: 0) {
    this.bookmarkId = value;
  }

  @Input() summaryType = 'keyword';
  @Input() relationId = '';
  @Input() sheetSetting = {};

  @Input() operType = 'save';



  public submitting = false;
  constructor(private fb: FormBuilder,
              private _message: NzMessageService,
              private bookmarkService: BookmarkService,
              private subject: NzModalRef) {}
  submitForm() {
    for (const key in this.validateForm.controls) {
      if (key) {
        this.validateForm.controls[ key ].markAsDirty();
      }
    }
    const postResult = {bookmark_name: this._name, summary_type: this.summaryType, sheets_setting: this.sheetSetting, relation_id: this.relationId};
    if (this.validateForm.valid && !this.submitting) {
      this.submitting = true;
      if (this.bookmarkId > 0 ) {
        postResult['bookmark_id'] = this.bookmarkId;
        this.bookmarkService.updateBookMark(postResult)
          .subscribe(
            response => {
              if (response.status_code === 200) {
                this._message.success('编辑书签页成功');
                this.subject.destroy({
                  status: 'Ok',
                  result: {oper: 'edit', data: {dashboard_id: this.bookmarkId, dashboard_name: this._name, is_default: 0}}
                });
              } else {
                this._message.error('编辑书签页失败,请重试');
              }
            },
            (err) => {
              this._message.error('编辑书签页失败，请重试');
            }
          );
      } else {
        // postResult['components'] = [];

        this.bookmarkService.createBookMark(postResult).subscribe(
          response => {
            if (response.status_code === 200) {
              this._message.success('新建书签成功');
              this.subject.destroy({
                status: 'Ok',
                result: {oper: 'save', data: response.data}
              });

            } else {
              this._message.error('新建书签页失败');
            }
          },
          (err) => {
            this._message.error('新建书签d页失败，请重试');
          },
          () => {
          this.submitting = false;
        }
        );
      }
    }

  }
  getFormControl(name) {
    return this.validateForm.controls[ name ];
  }

  cancelForm() {
    this.subject.destroy('onCancel');
  }

  ngOnInit() {
    this.validateForm = this.fb.group({
      dashboard_name: [ '', [ Validators.required ] ]
    });
  }
}




