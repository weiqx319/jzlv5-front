import { Component, OnInit } from '@angular/core';
import {ManageService} from "../../../../service/manage.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {DefineSettingService} from "../../../../service/define-setting.service";
import {deepCopy} from "@jzl/jzl-util";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-data-role-create',
  templateUrl: './data-role-create.component.html',
  styleUrls: ['./data-role-create.component.scss']
})
export class DataRoleCreateComponent implements OnInit {
  public operateList = [
    {
      key: "include",
      label: "为",
    },
    {
      key: "not_include",
      label: "排除",
    },
  ];

  public advertiserList = [];

  public defaultData = {
    role_name: "",
    role_data: {
      company_metric: {
        permission_type:  "include",
        data: []
      },
      custom_role_data: [],
    },
  };

  public companyMetricList = [];

  public roleId;

  public conversionMapList = {};

  public metricMapList = {};

  constructor(private route: ActivatedRoute,private manageService: ManageService, private message: NzMessageService,private defineSettingService: DefineSettingService,) { }

  ngOnInit(): void {
    this.roleId = this.route.snapshot.params['roleId'];
    this.getAdvertiserList();
    this.getConversionList();
    this.getMetricList();
    this.getCompanyMetricList();
    if(this.roleId) {
      this.getDataRoleDetail();
    }
  }

  goBack() {
    history.go(-1);
  }

  getDataRoleDetail() {
    const postBody = {
      type: "",
      role_ids: [this.roleId]
    };
    this.defineSettingService.dataRoleDetail(postBody, {}).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        const resultData = result['data'][0];
        this.defaultData.role_name = resultData.role_name;
        if(resultData.role_data) {
          this.defaultData.role_data.company_metric = resultData.role_data.company_metric;
          for (const item of Object.keys(resultData.role_data.conversion)) {
            this.defaultData.role_data.custom_role_data.push({cid: Number(item), conversion: {permission_type: resultData.role_data.conversion[item].permission_type, data:resultData.role_data.conversion[item].data}, metric: {}});
          }
          for (const item of this.defaultData.role_data.custom_role_data) {
            if(resultData.role_data.metric[item.cid]) {
              item['metric']['permission_type'] = resultData.role_data.metric[item.cid].permission_type;
              item['metric']['data'] = resultData.role_data.metric[item.cid].data;
            }
          }
        }
      } else {
        this.message.error(result.message);
      }}, err => {
      this.message.error('系统异常，请重试');
      }
    );
  }

  getAdvertiserList() {
    this.manageService.getAdvertiserList({}, { result_model: 'all', need_publish_account: 0 }).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        this.advertiserList = result['data'];
      } else {
        this.message.error(result.message);
      }}, err => {
        this.message.error('系统异常，请重试');
      }
    );
  }

  // 自定义转化
  getConversionList() {
    const postBody = {
      'pConditions': []
    };
    this.defineSettingService.getConversionList(postBody, { page: 1, count: 100000 }).subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          const resultList = results['data']['detail'];
          resultList.forEach(item => {
            if(!this.conversionMapList[item.cid]) {
              this.conversionMapList[item.cid] = [];
            }
            this.conversionMapList[item.cid].push(item);
          });
        }
      }, (err: any) => {
        this.message.error('数据获取异常，请重试');
      },
      () => {
      }
    );
  }

  // 自定义指标
  getMetricList() {
    const postBody = {
      'pConditions': []
    };
    this.defineSettingService.getMetricList(postBody, { page: 1, count: 100000 }).subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          const resultList = results['data']['detail'];
          resultList.forEach(item => {
            if(!this.metricMapList[item.cid]) {
              this.metricMapList[item.cid] = [];
            }
            this.metricMapList[item.cid].push(item);
          });
        }
      }, (err: any) => {
        this.message.error('数据获取异常，请重试');
      },
      () => {
      }
    );
  }

  // 集团指标
  getCompanyMetricList() {
    const postBody = {
      'pConditions': []
    };
    this.defineSettingService.getCompanyMetricList(postBody, { page: 1, count: 100000 }).subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          this.companyMetricList = results['data']['detail'];
        }
      }, (err: any) => {
        this.message.error('数据获取异常，请重试');
      },
      () => {
      }
    );
  }

  // 添加自定义权限/指标
  addPermission() {
    if(this.defaultData.role_data.custom_role_data.length < this.advertiserList.length) {
      const obj = {
        cid: "",
        conversion: {
          permission_type: "include",
          data:[],
        },
        metric: {
          permission_type: "include",
          data:[],
        },
      };
      this.defaultData.role_data.custom_role_data.push(obj);
    }
  }

  // 删除自定义权限/指标
  deleteCustomPermission(index) {
    this.defaultData.role_data.custom_role_data.splice(index,1);
    for (const adItem of this.advertiserList) {
      if (adItem.cid === this.advertiserList[index].cid) {
        adItem.is_disabled = false;
      }
    }
  }

  changeAdvertiser() {
    for (const adItem of this.advertiserList) {
      adItem.is_disabled = false;
      for (const roleItem of this.defaultData.role_data.custom_role_data) {
        if (roleItem.cid === adItem.cid) {
          adItem.is_disabled = true;
        }
      }
    }
  }

  doSave() {
    if(!this.defaultData.role_name) {
      this.message.error("角色名称必填");
      return;
    }
    const conversionMap = {};
    const metricMap = {};
    const resultData = deepCopy(this.defaultData);
    this.defaultData.role_data.custom_role_data.forEach(item => {
      if(item.cid !== '') {
        conversionMap[item.cid] = {
          permission_type: item.conversion.permission_type,
          data: item.conversion.data,
        };
        metricMap[item.cid] = {
          permission_type: item.metric.permission_type,
          data: item.metric.data,
        };
      }
    });

    resultData.role_data['conversion'] = conversionMap;
    resultData.role_data['metric'] = metricMap;
    delete resultData.role_data.custom_role_data;

    if(this.roleId) {
      this.defineSettingService.updateDataRole(this.roleId,resultData).subscribe((results: any) => {
          if (results.status_code === 200) {
            this.message.info("修改成功");
            this.goBack();
          }}, (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        }
      );
    } else {
      this.defineSettingService.addDataRole(resultData).subscribe((results: any) => {
          if (results.status_code === 200) {
            this.message.info("创建成功");
            this.goBack();
          }}, (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        }
      );
    }
  }
}
