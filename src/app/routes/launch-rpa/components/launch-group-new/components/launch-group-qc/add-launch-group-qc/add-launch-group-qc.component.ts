import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {GlobalTemplateComponent} from "../../../../../../../shared/template/global-template/global-template.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../../../../../core/service/auth.service";
import {NzModalRef} from "ng-zorro-antd/modal";
import {NzMessageService} from "ng-zorro-antd/message";
import {LaunchRpaService} from "../../../../../service/launch-rpa.service";
import {MenuService} from "../../../../../../../core/service/menu.service";
import {deepCopy} from "@jzl/jzl-util";

@Component({
  selector: 'app-add-launch-group-qc',
  templateUrl: './add-launch-group-qc.component.html',
  styleUrls: ['./add-launch-group-qc.component.scss']
})
export class AddLaunchGroupQcComponent implements OnInit {
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
    "third_industry_ids": [], //创意分类
    "comment": "", //备注
    "convert_cost": null, //客户成本
  };
  public parentTree = [];
  public treeData: any;
  public parentInfo: any;
  public status = false;
  public submit = false;

  public accountsList = [];

  public categoryList = [];


  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private modalSubject: NzModalRef,
              private message: NzMessageService,
              public launchRpaService: LaunchRpaService,
              public menuService:MenuService,) {

    this.launchGroupForm = this.fb.group({
      project_name: ['', [Validators.required]],
      chan_pub_id_lst: [[], [Validators.required]],
      // third_industry_ids: [[],[Validators.required]],
      convert_cost: ['', [Validators.required]],
      comment: [''],
      stage: [''],
      enable: [''],

    });
  }


  ngOnInit(): void {
    this.getAccountList();
    this.getFeedConfigCreativeCategory();
    if(this.isEdit) {
      this.getLaunchProjectDetail();
    }
  }
  getFormControl(name) {
    return this.launchGroupForm.controls[name];
  }

  getLaunchProjectDetail() {
    this.launchRpaService.getLaunchProjectDetailNew(this.launchGroupId, {cid:this.authService.getCurrentUserOperdInfo().select_cid})
      .subscribe(
        (results: any) => {

          if (results.status_code !== 200) {

          } else {
            const data = deepCopy(results['data']);
            // const industryData = data.third_industry_ids[0].split('-');
            // data.third_industry_ids = [];
            // industryData.forEach(item => {
            //   data.third_industry_ids.push(Number(item));
            // });
            data['enable'] = data.enable !== "0";
            this.defaultData = deepCopy(data);
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
          "value": "7"
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

  // 获取创意分类
  getFeedConfigCreativeCategory() {
    this.launchRpaService.getThirdIndustryListQC()
      .subscribe(
        (results: any) => {

          if (results.status_code !== 200) {

          } else {
            this.categoryList = results['data'];
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
    // let industryIds = "";

    if (!this.launchGroupForm.valid) {
      return false;
    }

    if (!this.submit) {
      this.submit = true;
      const body = deepCopy(this.defaultData);
      // this.defaultData.third_industry_ids.forEach(item => {
      //   industryIds = industryIds ? industryIds + '-' + item : item;
      // });
      // body.third_industry_ids = [industryIds];
      body.enable = body.enable ? "1" : "0";

      if(this.isEdit) {
        this.launchRpaService.updateLaunchProjectNew(this.launchGroupId, body, {cid: this.authService.getCurrentUserOperdInfo().select_cid,}).subscribe(result => {
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
        this.launchRpaService.createLaunchProjectNew(body, {cid: this.authService.getCurrentUserOperdInfo().select_cid,}).subscribe(result => {
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
