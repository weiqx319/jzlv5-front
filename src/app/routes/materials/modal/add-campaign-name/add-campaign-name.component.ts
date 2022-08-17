import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import {MaterialsService} from "../../service/materials.service";
import {AuthService} from "../../../../core/service/auth.service";
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import {environment} from "../../../../../environments/environment";
import {LaunchService} from "../../service/launch.service";

@Component({
  selector: 'app-add-campaign-name',
  templateUrl: './add-campaign-name.component.html',
  styleUrls: ['./add-campaign-name.component.scss']
})
export class AddCampaignNameComponent implements OnInit {
  @ViewChild('inputBox') inputBox: ElementRef;

  @Input() set campaignNameData(data) {
    this.nameList[0] = JSON.parse(JSON.stringify(data));

  }

  @Input() isEdit = false;

  public url_reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
  public urlReg: any;

  public currentIndex = 0;
  public cursorPosition = 0;

  public nameList = [
    {
      adgroup_name_template_name: null,
      adgroup_name_template: null,
    }
  ];

  public cid;
  public submiting = false;

  constructor(private modalService: NzModalService,
              private message: NzMessageService,
              private materialsService: MaterialsService,
              private launchService: LaunchService,
              private authService: AuthService,
              private modalSubject: NzModalRef,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.urlReg = new RegExp(this.url_reg);
  }

  contentChange(data, i) {
    this.nameList[i].adgroup_name_template = data;
  }

  getCurrentFocus(index) {
    this.currentIndex = index;
  }

  addTags(value) {
    const tagValueLength = value.length + 2;

    const curInput = this.inputBox.nativeElement.querySelectorAll('.ipts')[this.currentIndex];
    this.cursorPosition = curInput.selectionStart;

    const stringObj = this.materialsService.getStringByPosition(curInput.selectionStart, curInput.selectionEnd, curInput.value);
    this.nameList[this.currentIndex].adgroup_name_template = stringObj.startStr + '{' + value + '}' + stringObj.endStr;
    curInput.value = this.nameList[this.currentIndex].adgroup_name_template;

    this.cursorPosition += tagValueLength;

    if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核

    } else {
      curInput.select();
      curInput.selectionStart = this.cursorPosition;
      curInput.selectionEnd = this.cursorPosition;
    }
  }

  removeItem(index) {
    this.nameList.splice(index, 1);

    if (this.currentIndex >= this.nameList.length) {
      this.currentIndex = 0;
    }
  }

  addItem(index) {
    const addItem = {
      adgroup_name_template_name: '',
      adgroup_name_template: '',
    };
    this.nameList.splice(index + 1, 0, addItem);
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    let dataValid = true;
    for (let i = 0; i < this.nameList.length; i++) {
      if (!this.nameList[i].adgroup_name_template_name || !this.urlReg.test(this.nameList[i].adgroup_name_template)) {
        dataValid = false;
        break;
      }
    }

    if (!dataValid) {
      this.message.error('请完善计划名或');
      return false;
    }

    if (!this.submiting) {
      this.submiting = true;
      const body = this.nameList;
      // this.materialsService.addMaterialsAuthor(body, {cid: this.cid}).subscribe(result => {
      //   this.loading = false;
      //   if (result.status_code && result.status_code === 200) {
      //     this.message.success('操作成功');
      //     this.modalSubject.destroy('onOk');
      //   } else if (result.status_code && result.status_code === 205) {
      //
      //   } else {
      //     this.message.error(result.message);
      //   }
      //
      // }, err => {
      //   this.loading = false;
      // });
    }
  }

}
