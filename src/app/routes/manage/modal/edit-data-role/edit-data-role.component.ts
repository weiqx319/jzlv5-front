import {Component, Input, OnInit} from '@angular/core';
import {DefineSettingService} from "../../service/define-setting.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {NzModalRef} from "ng-zorro-antd/modal";
import {ManageService} from "../../service/manage.service";

@Component({
  selector: 'app-edit-data-role',
  templateUrl: './edit-data-role.component.html',
  styleUrls: ['./edit-data-role.component.scss']
})
export class EditDataRoleComponent implements OnInit {

  @Input() data;

  public dataRoleList = [];

  public defaultData = {
    data_role_ids: []
  };

  constructor(private defineSettingService: DefineSettingService, private message: NzMessageService, private subject: NzModalRef, private manageService: ManageService,) { }

  ngOnInit(): void {
    this.getDataRoleList();
    this.defaultData.data_role_ids = this.data.data_role_ids;
  }

  getDataRoleList() {
    this.defineSettingService.dataRoleList({},{ result_model: 'all' }).subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          this.dataRoleList = results['data'];
        }
      },
      (err: any) => {
        this.message.error('数据获取异常，请重试');
      },
      () => {
      }
    );
  }

  cancel() {
    this.subject.destroy('onCancel');
  }

  doSave() {
    this.manageService.updateDataRole(this.data.user_id,this.defaultData).subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          this.dataRoleList = results['data'];
          this.subject.destroy('onOk');
        }
      },
      (err: any) => {
        this.message.error('数据获取异常，请重试');
      },
      () => {
      }
    );
  }

}
