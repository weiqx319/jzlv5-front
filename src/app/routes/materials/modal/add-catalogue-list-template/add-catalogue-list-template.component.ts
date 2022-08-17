import { Component, OnInit, Input } from '@angular/core';
import {AuthService} from "../../../../core/service/auth.service";
import {CustomDatasService} from "../../../../shared/service/custom-datas.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {LaunchService} from "../../service/launch.service";
import {MenuService} from '../../../../core/service/menu.service';

@Component({
  selector: 'app-add-catalogue-list-template',
  templateUrl: './add-catalogue-list-template.component.html',
  styleUrls: ['./add-catagolue-template.component.scss']
})
export class AddCatalogueListTemplateComponent implements OnInit {




  @Input() set catalogueData(data) {
    this.list[0] = JSON.parse(JSON.stringify(data));
    this.catalogue_id = data.catalogue_id;
  }

  @Input() isEdit = false;

  public catalogue_id  = null;

  public list = [
    {
      catalogue_id: '',
      old_catalogue_id: '',
      catalogue_name: '',
    }
  ];

  public submiting = false;
  public cid;

  constructor(
    private message: NzMessageService,
    private authService: AuthService,
    private customDataService: CustomDatasService,
    private launchService: LaunchService,
    private menuService:MenuService,
    private modalSubject: NzModalRef,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.list.forEach(item=> {
      item['old_catalogue_id'] = item['catalogue_id'];
    });
  }



  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {

    let dataValid = true;

    for (let i = 0; i < this.list.length; i++) {
      if (!this.list[i].catalogue_id || !this.list[i].catalogue_name) {
        dataValid = false;
        break;
      }
    }

    if (!dataValid) {
      this.message.error('请完善信息');
      return false;
    }

    if (!this.submiting) {
      this.submiting = true;

      if (!this.catalogue_id) {
        const firstData = this.list[0];
        const body = {publisher_id:this.menuService.currentPublisherId,channel_id:this.menuService.currentChannelId,catalogue_id:firstData['catalogue_id'],catalogue_name:firstData['catalogue_name']};
        this.launchService
          .addCatalogueList(body, {
            cid: this.cid,
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
        const firstData = this.list[0];
        const body = {publisher_id:this.menuService.currentPublisherId,channel_id:this.menuService.currentChannelId,catalogue_id:firstData['catalogue_id'],catalogue_name:firstData['catalogue_name'],old_catalogue_id:firstData['old_catalogue_id']};

        this.launchService
          .updateCatalogueList(body, {
            cid: this.cid,
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
