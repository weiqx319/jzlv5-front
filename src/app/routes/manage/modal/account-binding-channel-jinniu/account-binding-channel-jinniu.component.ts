import {Component, Input, OnInit} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd/message";
import {NzModalRef} from "ng-zorro-antd/modal";
import {MenuService} from "../../../../core/service/menu.service";
import {ManageService} from "../../service/manage.service";

@Component({
  selector: 'app-account-binding-channel-jinniu',
  templateUrl: './account-binding-channel-jinniu.component.html',
  styleUrls: ['./account-binding-channel-jinniu.component.scss']
})
export class AccountBindingChannelJinniuComponent implements OnInit {
  @Input() accountSetting;

  public currentStep = -1;
  public jinniuCode = "";
  public jinniuSearchName = "";
  public selectAccountData=[];
  public allChecked=false;
  public indeterminate=false;
  public saveing = false;
  public searchAccountName='';

  constructor(
    private manageService: ManageService,
    private message: NzMessageService,
    private subject: NzModalRef,
    public menuService: MenuService,
  ) {}

  ngOnInit(): void {
  }

  getJinniuAccountTree() {
    const postBody= {
      publisher_id: 23,
      cid:this.accountSetting.cid,
      auth_code: this.jinniuCode,
      account_label:this.jinniuSearchName,
      discount: this.accountSetting.discount,
    };
    this.manageService.getJinniuAccountData(postBody).subscribe((data) => {
      if (data.status_code === 200) {
        const listData = JSON.parse(JSON.stringify(data.data));
        listData.forEach(item => {
          item.key = item.pub_account_id;
          item.title = item.pub_account_name;
        });
        this.selectAccountData = [...listData];
      } else {
        this.message.error(data.message);
      }
    }, (err) => {
      this.message.error('系统异常，请重试', { nzDuration: 10000 });
    });
  }

  //全选 选择当前页
  _checkAll(value) {
    if (value) {
      this.allChecked = true;
      this.selectAccountData.forEach((data) => {
        if (!data.disabled) {
          data.checked = true;
        }
      });
      this.indeterminate = true;
    } else {
      this.allChecked = false;
      this.indeterminate = false;
      this.selectAccountData.forEach((data) => (data.checked = false));
    }
  }

  _refreshSingleChangeStatus(event?) {
    const allChecked = this.selectAccountData.every(
      (value) => value.checked,
    );
    const allUnchecked = this.selectAccountData.every((value) => !value.checked);

    // 表示不是全选，但是有选中的
    this.indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this.allChecked = allChecked;
  }
  cancel() {
    this.subject.destroy('onCancel');
  }
  bindAccountTree() {
    const selectResult = [];
    this.selectAccountData.map(item => {
      if (item.checked&&item.key!='0') {
        selectResult.push(item);
      }
    });
    if (selectResult.length < 1) {
      this.message.error('请选择帐户');
    } else {
      const postData = {
        list: [...selectResult]
      };

      this.saveing = true;

      this.manageService.createJinniuAccountOauth(postData).subscribe((data) => {
        if (data['status_code'] && data.status_code === 200) {
          this.message.success('保存成功');
          this.subject.destroy('onOk');
        } else {
          this.message.error(data.message, { nzDuration: 10000 });
        }
      }, (err) => {

        this.saveing = false;
        this.message.error('系统异常，请重试', { nzDuration: 10000 });
      });

    }
  }

  next() {
    this.currentStep += 1;
  }
  prev() {
    this.currentStep -= 1;
  }
}
