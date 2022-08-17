import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NotifyService } from "../../../../module/notify/notify.service";
import { AuthService } from "../../../../core/service/auth.service";
import { isNumber } from "@jzl/jzl-util";
import { FolderService } from "../../service/folder.service";
import { EditMessageComponent } from "../../../../module/edit-message/edit-message.component";

@Component({
  selector: 'app-edit-folder-name',
  templateUrl: './edit-folder-name.component.html',
  styleUrls: ['./edit-folder-name.component.scss'],
  providers: [FolderService]
})
export class EditFolderNameComponent implements OnInit {

  public folder_name = {
    edit_source: 'single',  //single：单个  batch:批量
    action: 1, //1:前缀  2：后缀  3：替换
    search: '',
    value: ''
  };

  public action = [
    { name: '添加前缀', value: 1 },
    { name: '添加后缀', value: 2 },
    { name: '查找替换', value: 3 },
  ];

  public iswraing = false;
  public idsArray = [];
  public saving = false;

  @Input() parentData: any;
  constructor(
    private modalService: NzModalService,
    private folderService: FolderService,
    private modalSubject: NzModalRef,
    private message: NzMessageService) { }

  ngOnInit() {

    if (this.parentData.selected_type === 'current') {
      this.parentData['selected_data'].forEach(item => {
        this.idsArray.push(item['folder_id']);
      });
    }

    if (this.parentData['selected_data'].length === 1) {
      this.folder_name.edit_source = 'single';
      this.folder_name.value = this.parentData['selected_data'][0]['folder_name'];
    } else if (this.parentData['selected_data'].length > 1) {
      this.folder_name.edit_source = 'batch';
    }
  }
  check() {
    if (this.parentData.selected_data.length === 1) {
      if (!this.folder_name.value) {
        this.iswraing = true;
      }
    } else {
      if (this.folder_name.action === 3) {
        if (!this.folder_name.search) {
          this.iswraing = true;
        }
      } else {
        if (!this.folder_name.value) {
          this.iswraing = true;
        }
      }
    }

  }
  cancel() {
    this.modalSubject.destroy('onCancel');

  }
  sure() {
    this.check();
    if (!this.iswraing) {
      this.saving = true;

      const folderData = this.getFolderData(this.folder_name, this.parentData.selected_type);
      folderData['name_setting'] = this.folder_name;
      this.folderService.editFolderName(folderData).subscribe(
        (result) => {
          this.saving = false;
          if (result.status_code === 200) {
            if (result.data.repeat.length) {
              this.modalSubject.destroy({
                name: 'onOk_repeat',
                repeat: result.data.repeat
              });

            } else {
              this.message.success(result['message']);
              this.modalSubject.destroy({
                name: 'onOk'
              });

            }

          } else if (result['status_code'] && result.status_code === 401) {
            this.message.error(result['message']);
          } else if (result['status_code'] && result.status_code === 500) {
            this.message.error(result['message']);
          } else if (result['status_code'] && result.status_code === 205) {
          } else {
            this.message.error(result.message);
          }
        }, err => {
          this.saving = false;
        }, () => {
          this.saving = false;
        }
      );
    }

  }

  getFolderData(data, selectType) {
    const model = {
      "folder_details": {}
    };


    model['source'] = 'folderList' + "Edit";
    if (this.parentData['edit_source'] === false) { //点击来源
      model['edit_source'] = false;
    } else {
      model['edit_source'] = true;
    }
    model['folder_details']['select_type'] = selectType;
    if (selectType === 'current') {
      model['folder_details']['details'] = this.idsArray;
    } else if (selectType === 'all') {
      model['detail_content'] = [];
      model['folder_details']['sheets_setting'] = {
        'table_setting': this.parentData.allViewTableData
      };
    }
    model['folder_details']['type'] = 'folder_list';

    return model;
  }



}
