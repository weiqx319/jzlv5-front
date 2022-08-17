import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Observable } from "rxjs";
import { ManageService } from "../../service/manage.service";
import { ManageItemService } from "../../service/manage-item.service";
import { isUndefined } from "@jzl/jzl-util";
import { CustomDatasService } from "../../../../shared/service/custom-datas.service";
import { AuthService } from '../../../../core/service/auth.service';
import { ProductDataService } from "@jzl/jzl-product";
import { DefineSettingService } from "../../service/define-setting.service";

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  addRoleForm: FormGroup;
  open = {
    basic: true,
    account: false,
    optimizer: false,
    advert: false,
    data_role: false,
    super_account:false,
  };

  public rolesList = [];
  public publisherList = [];
  public keeperList=[];

  public selectedAccountList: Array<{ cid: number, channel_id: number, channelAll: any, media_type: number, selectAccounts: any[], selectedValues: any[], advertAccountList: any, advertAccountInfo: object }> = [];

  private _userData; any;

  @Input() roleId = 1;
  @Input() setting: any;

  @Input() accountList = [];

  private _userExistsBindAccountInfo = {};

  @Input() set userData(data: any) {
    this.defaultSetting = Object.assign(this.defaultSetting, {
      role_id: data['role_id'],
      user_name: data['user_name'],
      email: data['email'],
      data_role_ids: data['data_role_ids'],
    });
    this._userData = data;


    // --- 准备账户数据
    const accountByPublisher = {};
    data['publish_info'].forEach(item => {
      if (accountByPublisher[item.cid + "_" + item.publisher_id + '_' + item.channel_id]) {
        accountByPublisher[item.cid + "_" + item.publisher_id + '_' + item.channel_id]['chanPubIds'].push(item.chan_pub_id);
      } else {
        accountByPublisher[item.cid + "_" + item.publisher_id + '_' + item.channel_id] = { 'cid': item.cid, channel_id: item.channel_id, 'media_type': item.publisher_id, chanPubIds: [] };
        accountByPublisher[item.cid + "_" + item.publisher_id + '_' + item.channel_id]['chanPubIds'].push(item.chan_pub_id);
      }
    });
    this._userExistsBindAccountInfo = accountByPublisher;


    // -- 加载列表数据
    this.roleChange(data['role_id']);

    // -- 准备广告主数据
    data['ad_info'].forEach(item => {
      this.advertSelectedValue.push(item['cid']);
    });

    // -- 准备管家账户数据
    if (data['super_info']) {
      data['super_info'].forEach(item => {
        this.superAccountSelectedValue.push(item['super_account_id']);
      });
    }

    // -- 准备优化师数据
    data['user_info'].forEach(item => {
      this.optimizerSelectedValue.push(item['user_id']);
    });


  }

  @Input() userId = 0;

  public placeHolderPassword = '请输入密码';
  public placeHolderPasswordConfirm = '请确认密码';

  public defaultSetting = {
    role_id: 4,
    user_name: '',
    email: '',
    user_password: '',
    retry_password: '',
    add_publish: [],
    add_advertiser: [],
    add_users: [],
    data_role_ids: [],
    add_account:[],
  };
  public superAccountSelectedValue=[];

  public advertList = [];
  public advertSelectedValue = [];
  private _advertListLoad = false;
  public optimizerList = [];
  private _optimizerListLoad = false;
  public optimizerSelectedValue = [];

  public channelList = [];
  public channelObject = {
    "channel_1": { label: "搜索推广" },
    "channel_2": { label: "信息流" },
    "channel_3": { label: "应用市场" },
  };
  public channelAll = {};
  public accountAll = {};
  public productInfo = {};

  public dataRoleList = [];


  constructor(private fb: FormBuilder,
    private manageService: ManageService,
    private manageItemService: ManageItemService,
    private message: NzMessageService,
    private customDataService: CustomDatasService,
    private subject: NzModalRef,
    private productService: ProductDataService,
    private defineSettingService: DefineSettingService,) {
    this.rolesList = this.manageItemService.roleTypeList;
    this.customDataService.dealPublisherNewData().then(() => {
      this.publisherList = [...this.customDataService.publisherNewList];
    });

    this.addRoleForm = this.fb.group({
      role_id: ['', [Validators.required]],
      user_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/), Validators.email]],
      user_password: ['', [Validators.required]],
      check_password: ['', [Validators.required], [this.checkPasswordValidator]]
    });

    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });

  }

  roleChange(role): void {
    if (!this._advertListLoad) {
      this.loadAdvertiser();
    }
    if (role === 3 && !this._optimizerListLoad) {
      this.loadUserByRole();
    }

  }




  // -- 用户选择帐号
  removeAccount(index) {
    this.selectedAccountList.splice(index, 1);
  }

  addAccount() {
    const defaultSelectedAccount = { cid: 0, channel_id: 1, channelAll: {}, media_type: 1, selectAccounts: [], selectedValues: [], advertAccountList: {}, advertAccountInfo: {} };
    if (this.accountList.length > 0) {
      const accountAll = [];
      const channelAll = [];
      Object.keys(this.accountList[0]['publisher_accounts']).forEach(item => {
        const publisher = Number(item.split('_')[2]);
        channelAll['publisher_' + publisher] = [];
        const channelId = {};
        this.accountList[0]['publisher_accounts'][item].forEach(channel => {
          const number_channel_id = 'channel_' + channel.channel_id;
          if (!channelId[number_channel_id]) {
            channelId[number_channel_id] = [];
            channelId[number_channel_id].push({ id: channel.chan_pub_id, name: channel.pub_account_name });
            if (this.channelObject.hasOwnProperty('channel_' + channel.channel_id)) {
              channelAll['publisher_' + publisher].push({
                label: this.channelObject['channel_' + channel.channel_id].label,
                value: channel.channel_id,
              });
            }

          } else {
            channelId[number_channel_id].push({ id: channel.chan_pub_id, name: channel.pub_account_name });
          }
        });
        accountAll['publisher_' + publisher] = channelId;
      });


      defaultSelectedAccount.channelAll = channelAll;


      defaultSelectedAccount.advertAccountInfo = this.accountList[0];
      defaultSelectedAccount.cid = defaultSelectedAccount.advertAccountInfo['cid'];

      const publisher_ids = Object.keys(defaultSelectedAccount.advertAccountInfo['publisher_accounts']);
      defaultSelectedAccount.media_type = Number(publisher_ids[0].split('_')[2]);

      /*   defaultSelectedAccount.advertAccountList = defaultSelectedAccount.advertAccountInfo['publisher_accounts'][publisher_ids[0]].map((item) => {
           return {id: item.chan_pub_id, name: item.pub_account_name};
         });
         */
      defaultSelectedAccount.channel_id = channelAll['publisher_' + defaultSelectedAccount.media_type][0].value;

      // defaultSelectedAccount.advertAccountList = this.accountAll[defaultSelectedAccount.media_type][defaultSelectedAccount.channel_id];
      defaultSelectedAccount.advertAccountList = accountAll;
      this.selectedAccountList.push(defaultSelectedAccount);
    } else {
      this.message.info('您暂时无可用账户，请先绑定相关媒体账户', { nzDuration: 10000 });
    }
  }


  advertChange(cid, data: any) {
    const findAdvertInfo = this.accountList.find((item) => item.cid === cid);
    if (!isUndefined(findAdvertInfo)) {
      data.advertAccountInfo = findAdvertInfo;
      const publisher_ids = Object.keys(findAdvertInfo['publisher_accounts']);
      data.media_type = Number(publisher_ids[0].split('_')[2]);

      const accountAll = [];
      const channelAll = [];
      Object.keys(findAdvertInfo['publisher_accounts']).forEach(account => {
        const publisher = Number(account.split('_')[2]);
        channelAll['publisher_' + publisher] = [];
        const channelId = {};
        findAdvertInfo['publisher_accounts'][account].forEach(channel => {
          const number_channel_id = 'channel_' + channel.channel_id;
          if (!channelId[number_channel_id]) {
            channelId[number_channel_id] = [];
            channelId[number_channel_id].push({ id: channel.chan_pub_id, name: channel.pub_account_name });
            if (this.channelObject.hasOwnProperty('channel_' + channel.channel_id)) {
              channelAll['publisher_' + publisher].push({
                label: this.channelObject['channel_' + channel.channel_id].label,
                value: channel.channel_id,
              });
            }
          } else {
            channelId[number_channel_id].push({ id: channel.chan_pub_id, name: channel.pub_account_name });
          }
        });
        accountAll['publisher_' + publisher] = channelId;
      });

      data.channelAll = channelAll;
      data.advertAccountList = accountAll;


      if (data.channelAll['publisher_' + data.media_type]) {
        data.channel_id = data.channelAll['publisher_' + data.media_type][0].value;
      } else {
        data.channel_id = null;
      }
      data.selectedValues = [];
      /*data.advertAccountList = findAdvertInfo['publisher_accounts'][publisher_ids[0]].map((item) => {
        return {id: item.chan_pub_id, name: item.pub_account_name};
      });*/
    } else {
      // -- 删除当前行
    }
  }

  publisherTypeChange(type, data: any) {

    if (data.advertAccountInfo['publisher_accounts'] && data.advertAccountInfo['publisher_accounts']['publisher_id_' + type]) {
      /* data.advertAccountList = data.advertAccountInfo['publisher_accounts']['publisher_id_' + type].map((item) => {
         return {id: item.chan_pub_id, name: item.pub_account_name};
       });*/
      if (data.channelAll['publisher_' + data.media_type]) {
        data.channel_id = data.channelAll['publisher_' + data.media_type][0]['value'];
      }

      data.selectedValues = [];
    } else {
      data.channel_id = null;
      // data.advertAccountList = [];
      data.selectedValues = [];
    }
  }

  selectedValues(row, data) {
    row.selectedValues = data;
  }

  // ---  load advertiser

  loadAdvertiser(): void {
    this.manageService.getAdvertiserList({}, { result_model: 'all', need_publish_account: 0 }).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        const advertObj= {};
        result['data'].forEach(item=> {
          if (item.department) {
            if (!advertObj[item.department]) {
              advertObj[item.department]= {
                title:'事业部-' + item.department,
                key: item.department,
                children: [{ title: item.advertiser_name, key: item.cid, isLeaf: true }]
              };
            } else {
              advertObj[item.department].children.push({title: item.advertiser_name, key: item.cid, isLeaf: true});
            }
          } else {
            advertObj[item.cid]= {
              title: item.advertiser_name,
              key: item.cid,
              isLeaf: true,
            };
          }
        });
        this.advertList = Object.values(advertObj);
        this._advertListLoad = true;
      } else {
        this.advertList = [];
      }
    }, (err) => {
      this.message.error('系统异常，请重试', { nzDuration: 10000 });
    }
    );
  }
  transferTreeChange(sourceData, data: any[]) {
    this.advertSelectedValue = [...data];
  }

  loadUserByRole(): void {
    const resultCondition = {
      "pConditions": [
        {
          "key": "role_id",
          "op": "=",
          "value": "4"
        }
      ]
    };
    this.manageService.getUserList(resultCondition, { result_model: 'all' }).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        this.optimizerList = result['data'].map(item => {
          return { id: item.user_id, name: item.user_name };
        });
        this._optimizerListLoad = true;
      } else {
        this.optimizerList = [];
      }
    }, (err) => {

      this.message.error('系统异常，请重试');
    }
    );
  }




  selectedAdvertValues(data) {
    this.advertSelectedValue = data;
  }

  selectedOptimizerValues(data) {
    this.optimizerSelectedValue = data;
  }




  ngOnInit() {
    this.getDataRoleList();
    this.getAccountKeeperList();
    this.channelObject = this.customDataService.channelMapLabel;

    if (this.roleId == 3) {
      this.rolesList = this.manageItemService.roleTypeList3;
    }

    if (this.userId > 0) {
      this.placeHolderPassword = '******';
      this.placeHolderPasswordConfirm = '******';
      this.addRoleForm = this.fb.group({
        role_id: ['', [Validators.required]],
        user_name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        user_password: [''],
        check_password: ['', [], [this.checkPasswordValidator]]
      });
      this.addRoleForm.removeControl('user_password');
      this.addRoleForm.removeControl('check_password');
    } else {

    }



    Object.values(this._userExistsBindAccountInfo).forEach(item => {
      const defaultSelectedAccount = {
        cid: item['cid'],
        media_type: item['media_type'],
        selectAccounts: [],
        selectedValues: item['chanPubIds'],
        advertAccountList: {},
        advertAccountInfo: {},
        channel_id: item['channel_id'],
        channelAll: {}
      };
      if (this.accountList.length > 0) {
        const accountAll = [];
        const channelAll = [];
        defaultSelectedAccount.advertAccountInfo = this.accountList.find((acc) => acc['cid'] === item['cid']);
        Object.keys(defaultSelectedAccount.advertAccountInfo['publisher_accounts']).forEach(account => {
          const publisher = Number(account.split('_')[2]);
          channelAll['publisher_' + publisher] = [];
          const channelId = {};
          defaultSelectedAccount.advertAccountInfo['publisher_accounts'][account].forEach(channel => {
            const number_channel_id = 'channel_' + channel.channel_id;
            if (!channelId[number_channel_id]) {
              channelId[number_channel_id] = [];
              channelId[number_channel_id].push({ id: channel.chan_pub_id, name: channel.pub_account_name });
              if (this.channelObject.hasOwnProperty('channel_' + channel.channel_id)) {
                channelAll['publisher_' + publisher].push({
                  label: this.channelObject['channel_' + channel.channel_id].label,
                  value: channel.channel_id,
                });
              }


            } else {
              channelId[number_channel_id].push({ id: channel.chan_pub_id, name: channel.pub_account_name });
            }
          });
          accountAll['publisher_' + publisher] = channelId;
        });

        if (!isUndefined(defaultSelectedAccount.advertAccountInfo)) {
          defaultSelectedAccount.channelAll = channelAll;
          defaultSelectedAccount.advertAccountList = accountAll;
          this.selectedAccountList.push(defaultSelectedAccount);
        }
      }
    });




  }

  collapseChange(type: any) {
    Object.keys(this.open).forEach((item) => {
      if (item === type) {
        this.open[item] = true;
      } else {
        this.open[item] = false;
      }
    });
  }

  getFormControl(name) {
    return this.addRoleForm.controls[name];
  }

  cancel() {
    this.subject.destroy('onCancel');
  }

  doSave() {
    const postAccountList = {};


    if (this.defaultSetting.role_id === 2) {
      this.selectedAccountList = [];
    } else {
      if (this.selectedAccountList.length > 0) {
        this.selectedAccountList.forEach(item => {
          if (item.selectedValues.length > 0) {
            item.selectedValues.forEach(selectedValue => {
              postAccountList[item.cid + '_' + selectedValue] = { cid: item.cid, chan_pub_id: selectedValue };
            });
          }
        });
      }
    }
    if (Object.values(postAccountList).length > 0) {
      this.defaultSetting.add_publish = Object.values(postAccountList);
    } else {
      this.defaultSetting.add_publish = [];
    }

    let postAdvertList = [];
    if (this.advertSelectedValue.length > 0) {
      postAdvertList = this.advertSelectedValue.map((item) => {
        return { cid: item };
      });
      this.defaultSetting.add_advertiser = postAdvertList;
    } else {
      this.defaultSetting.add_advertiser = [];
    }
    this.defaultSetting.add_account=[];
    if (this.superAccountSelectedValue.length > 0) {
      this.superAccountSelectedValue.forEach(id=> {
        this.defaultSetting.add_account.push({
          "super_account_id":id
        });
      });
    }


    let postOptimizerList = [];

    if (this.optimizerSelectedValue.length > 0) {
      postOptimizerList = this.optimizerSelectedValue.map(item => {
        return { user_id: item };
      });
      this.defaultSetting.add_users = postOptimizerList;
    } else {
      this.defaultSetting.add_users = [];
    }

    let updateUser$: Observable<any>;
    if (this.userId > 0) {
      updateUser$ = this.manageService.updateUser(this.userId, this.defaultSetting);
    } else {
      updateUser$ = this.manageService.createUser(this.defaultSetting);
    }
    updateUser$.subscribe(data => {
      if (data['status_code'] && data.status_code === 200) {
        this.message.success('保存成功');
        this.subject.destroy('onOk');
      } else if (data['status_code'] && data.status_code === 201) {
        this.message.error(data['message'], { nzDuration: 10000 });
      } else if (data['status_code'] && data.status_code === 401) {
        this.message.error('您没权限对此操作！', { nzDuration: 10000 });
        this.cancel();
      } else if (data['status_code'] && data.status_code === 500) {
        this.message.error('系统异常，请重试', { nzDuration: 10000 });
      } else {
        this.message.error(data.message, { nzDuration: 10000 });
      }
    }, (err) => {
      this.message.error('系统异常，请重试', { nzDuration: 10000 });
    });
  }










  checkPasswordValidator = (control: FormControl): any => {
    const _that = this;
    return Observable.create(function (observer) {
      if (control.value === _that.addRoleForm.controls['user_password'].value) {
        observer.next(null);
      } else {
        observer.next({ error: true });
      }
      observer.complete();
    });
  }

  getDataRoleList() {
    this.defineSettingService.dataRoleList({}, { result_model: 'all' }).subscribe(
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
  getAccountKeeperList() {
    this.manageService
      .getAccountKeeperList({}, { result_model: 'all', need_publish_account: 0 })
      .subscribe(
        (result) => {
          if (result['status_code'] && result.status_code === 200) {
            result['data'].forEach((item) => {
              this.keeperList.push({
                name: item.super_account_name,
                key: item.super_account_id,
                publisher_id: item.publisher_id,
                channel_id: item.channel_id,
              });
            });
          } else if (result['status_code'] && result.status_code === 201) {
            this.message.error('广告主名称已经存在，请重试');
          } else if (result['status_code'] && result.status_code === 401) {
            this.message.error('您没权限对此操作！');
          } else if (result['status_code'] && result.status_code === 500) {
            this.message.error('系统异常，请重试');
          } else {
            this.message.error(result.message);
          }
        },
        (err) => {

          this.message.error('系统异常，请重试');
        },
      );
  }

}
