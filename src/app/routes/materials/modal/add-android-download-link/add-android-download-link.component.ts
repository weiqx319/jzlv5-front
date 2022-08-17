import { Component, OnInit, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {AuthService} from "../../../../core/service/auth.service";
import {CustomDatasService} from "../../../../shared/service/custom-datas.service";
import {LaunchService} from "../../service/launch.service";
import {MenuService} from "../../../../core/service/menu.service";

@Component({
  selector: 'app-add-android-download-link',
  templateUrl: './add-android-download-link.component.html',
  styleUrls: ['./add-android-download-link.component.scss']
})
export class AddAndroidDownloadLinkComponent implements OnInit {

  @Input() set linkData(data) {
    this.list[0] = JSON.parse(JSON.stringify(data));
    this.app_url_id = data.app_url_id;
  }

  @Input() isEdit = false;

  public app_url_id = null;

  public list = [
    {
      app_url_type: '1', // 1 安卓  2 苹果   3 落地页
      app_url_name: '', // 链接名称
      app_url: '', // 链接
      app_name: '', // 包名称    落地页此字段为空
    }
  ];

  public submiting = false;
  public cid;

  public publisher_id;

  constructor(
    private message: NzMessageService,
    private authService: AuthService,
    private customDataService: CustomDatasService,
    private launchService: LaunchService,
    private modalSubject: NzModalRef,
    public menuService: MenuService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.publisher_id = this.menuService.currentPublisherId;
  }

  ngOnInit() {
  }

  removeUrl(index) {
    this.list.splice(index, 1);
  }

  addUrl(index) {
    const addItem = {
      app_url_type: '1', // 1 安卓  2 苹果   3 落地页
      app_url_name: '', //链接名称
      app_url: '', //链接
      app_name: '',// 包名称    落地页此字段为空
    };
    this.list.splice(index + 1, 0, addItem);
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    let dataValid = true;

    for (let i = 0; i < this.list.length; i++) {
      if (!this.list[i].app_url_name || !this.list[i].app_url) {
        dataValid = false;
        break;
      }
    }

    if (!dataValid) {
      this.message.error('请完善下载链接');
      return false;
    }

    if (!this.submiting) {
      this.submiting = true;

      if (this.app_url_id) {
        const body = {...this.list[0]};
        this.launchService
          .updateAppTypeUrl(body, this.app_url_id, {
            cid: this.cid,
            publisher_id:this.publisher_id
          })
          .subscribe(
            (result: any) => {
              if (result.status_code && result.status_code === 200) {
                this.message.success('操作成功');
                this.modalSubject.destroy('onOk');
              } else if (result.status_code && result.status_code === 205) {

              } else {
                this.message.error(result.message);
              }
              this.submiting = false;
            },
            (err: any) => {
              this.submiting = false;
            },
            () => {},
          );
      } else {
        const body = {
          url_list: [...this.list]
        };
        this.launchService
          .addAppTypeUrl(body, {
            cid: this.cid,
            publisher_id: this.publisher_id
          })
          .subscribe(
            (result: any) => {
              if (result.status_code && result.status_code === 200) {
                this.message.success('操作成功');
                this.modalSubject.destroy('onOk');
              } else if (result.status_code && result.status_code === 205) {

              } else {
                this.message.error(result.message);
              }
              this.submiting = false;
            },
            (err: any) => {
              this.submiting = false;
            },
            () => {},
          );
      }


    }
  }

}
