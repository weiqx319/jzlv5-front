import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {GlobalTemplateComponent} from "../../../../../../../shared/template/global-template/global-template.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../../../../../core/service/auth.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {LaunchRpaService} from "../../../../../service/launch-rpa.service";
import {MenuService} from "../../../../../../../core/service/menu.service";
import {deepCopy} from "@jzl/jzl-util";

@Component({
  selector: 'app-add-launch-group-new-uc',
  templateUrl: './add-launch-group-new-uc.component.html',
  styleUrls: ['./add-launch-group-new-uc.component.scss']
})
export class AddLaunchGroupNewUcComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;


  public launchGroupForm: FormGroup;
  @Input() source: any;
  @Input() menu_id: any;
  @Input() isEdit: any;
  @Input() launchGroupId: any;
  public device = 'pc';

  public versions = [
    {name: '分组菜单', key: 1},
    {name: '功能菜单', key: 2}
  ];

  public defaultData = {
    "project_name": "",
    "chan_pub_id_lst": [],
    "enable": true,
    "comment": "", //备注
    "convert_cost": null, //客户成本
    "project_incr_num_min": null, //项目自增编号开始
    "project_ince_num_max": null, //项目自增编号结束
    "project_incr_now_num":null,
  };
  public parentTree = [];
  public treeData: any;
  public parentInfo: any;
  public status = false;
  public submit = false;
  public minIncr=1;

  public accountsList = [];

  public categoryList = [];


  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private modalSubject: NzModalRef,
              private message: NzMessageService,
              private launchRpaService: LaunchRpaService,
              private menuService: MenuService) {

    this.launchGroupForm = this.fb.group({
      project_name: ['', [Validators.required]],
      chan_pub_id_lst: [[], [Validators.required]],
      convert_cost: ['', [Validators.required]],
      comment: [''],
      stage: [''],
      enable: [''],
      project_incr_num_min:[null],
      project_ince_num_max:[null],
      project_incr_now_num:[null],
    });
  }


  ngOnInit(): void {
    this.getAccountList();
    if(this.isEdit) {
      this.getLaunchProjectDetail();
    }
  }

  getFormControl(name) {
    return this.launchGroupForm.controls[name];
  }

  getLaunchProjectDetail() {
    this.launchRpaService.getLaunchProjectDetailNew(this.launchGroupId, {
      cid:this.authService.getCurrentUserOperdInfo().select_cid,
      publisher_id: this.menuService.currentPublisherId,
    })
      .subscribe(
        (results: any) => {

          if (results.status_code !== 200) {

          } else {
            const data = deepCopy(results['data']);
            data['enable'] = data.enable !== "0";
            this.defaultData = deepCopy(data);
            this.minIncr=this.defaultData.project_incr_num_min||1;
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  getAccountList() {
    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": this.menuService.currentPublisherId
        },
        {
          "key": "channel_id",
          "name": "",
          "op": "=",
          "value": "2"
        },
        {
          "key": "account_status",
          "name": "",
          "op": ">",
          "value": -1
        },
      ]
    };
    this.launchRpaService.getAccountList(body, {
      page: 1,
      count: 100000,
      cid: this.authService.getCurrentUserOperdInfo().select_cid,
      user_id: this.authService.getCurrentUserOperdInfo().select_uid,
      publisher_id: this.menuService.currentPublisherId,
    })
      .subscribe(
        (results: any) => {

          if (results.status_code !== 200) {

          } else {
            this.accountsList = results['data']['detail'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }



  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {

    if (!this.launchGroupForm.valid) {
      return false;
    }
    if(this.defaultData.project_incr_num_min&&this.defaultData.project_ince_num_max&&this.defaultData.project_incr_num_min>=this.defaultData.project_ince_num_max) {
      this.message.info('项目自增编号结束需大于项目自增编号开始');
    }

    if (!this.submit) {
      this.submit = true;
      const body = deepCopy(this.defaultData);
      body.enable = body.enable ? "1" : "0";

      if(this.isEdit) {
        this.launchRpaService.updateLaunchProjectNew(this.launchGroupId, body, {
          cid: this.authService.getCurrentUserOperdInfo().select_cid,
          publisher_id: this.menuService.currentPublisherId,
        }).subscribe(result => {
          this.submit = false;
          if (result.status_code && result.status_code === 200) {
            this.message.success('修改成功');
            this.modalSubject.destroy('onOk');
          } else if (result.status_code && result.status_code === 205) {

          } else {
            this.message.error(result.message);
          }

        }, err => {
          this.submit = false;
        });
      } else {
        this.launchRpaService.createLaunchProjectNew(body, {
          cid: this.authService.getCurrentUserOperdInfo().select_cid,
          publisher_id: this.menuService.currentPublisherId,
        }).subscribe(result => {
          this.submit = false;
          if (result.status_code && result.status_code === 200) {
            this.message.success('操作成功');
            this.modalSubject.destroy('onOk');
          } else if (result.status_code && result.status_code === 205) {

          } else {
            this.message.error(result.message);
          }

        }, err => {
          this.submit = false;
        });
      }
    }
  }
}
