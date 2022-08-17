import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {AuthService} from "../../../../core/service/auth.service";
import {CustomDatasService} from "../../../../shared/service/custom-datas.service";
import {MaterialsService} from "../../service/materials.service";
import {getStringLength, getStringLengthBaidu} from '../../../../shared/util/util';

@Component({
  selector: 'app-upload-doucuments-modal',
  templateUrl: './upload-doucuments-modal.component.html',
  styleUrls: ['./upload-doucuments-modal.component.scss']
})
export class UploadDoucumentsModalComponent implements OnInit {

  @ViewChild('curTextArea') curTextArea: ElementRef;
  @Input() publisherId = 7;
  public defaultData = {
    publisher_id: 7,
    title_list: [], // 文案
  };

  public titles = '';
  public wordList = [''];


  public cursorPosition = 0;

  public cid;
  public submit = false;

  constructor(
    private message: NzMessageService,
    private modalSubject: NzModalRef,
    private authService: AuthService,
    private customDataService: CustomDatasService,
    private materialsService: MaterialsService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;

  }

  ngOnInit() {
    this.defaultData.publisher_id = this.publisherId;
    this.getLaunchTitleWorld();
  }

  getLaunchTitleWorld() {
    if (this.publisherId != 1) {

      this.materialsService
        .getLaunchTitleWorld({
          page: 1,
          count: 10000000,
          cid: this.cid,
          publisher_id: this.publisherId
        })
        .subscribe(
          (results: any) => {
            if (results.status_code && results.status_code === 200) {
              const list = results['data'];
              this.wordList = [...list];

            } else if (results.status_code && results.status_code === 205) {

            } else {
              this.message.error(results.message);
            }
          },
          (err: any) => {
            this.message.error('数据获取异常，请重试');
          },
          () => {
          },
        );
    } else {

      this.materialsService
        .getLaunchTitleWorldBaidu({
          page: 1,
          count: 10000000,
          cid: this.cid,
          publisher_id: this.publisherId
        })
        .subscribe(
          (results: any) => {
            if (results.status_code && results.status_code === 200) {
              const list = results['data'];
              this.wordList = [...list];

            } else if (results.status_code && results.status_code === 205) {

            } else {
              this.message.error(results.message);
            }
          },
          (err: any) => {
            this.message.error('数据获取异常，请重试');
          },
          () => {
          },
        );
    }


  }


  addTags(value) {

    if (this.publisherId != 1) {
      const tagValueLength = value.length + 2;

      const curInput = this.curTextArea.nativeElement;
      this.cursorPosition = curInput.selectionStart;

      const stringObj = this.materialsService.getStringByPosition(curInput.selectionStart, curInput.selectionEnd, curInput.value);
      this.titles = stringObj.startStr + '{' + value + '}' + stringObj.endStr;
      curInput.value = this.titles;

      this.cursorPosition += tagValueLength;

      if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核

      } else {
        curInput.select();
        curInput.selectionStart = this.cursorPosition;
        curInput.selectionEnd = this.cursorPosition;
      }
    } else {
      const resultValue = value['value'];
      const tagValueLength = resultValue.length + 3;

      const curInput = this.curTextArea.nativeElement;
      this.cursorPosition = curInput.selectionStart;

      const stringObj = this.materialsService.getStringByPosition(curInput.selectionStart, curInput.selectionEnd, curInput.value);
      this.titles = stringObj.startStr + '#{' + resultValue + '}' + stringObj.endStr;
      curInput.value = this.titles;

      this.cursorPosition += tagValueLength;

      if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核

      } else {
        curInput.select();
        curInput.selectionStart = this.cursorPosition;
        curInput.selectionEnd = this.cursorPosition;
      }
    }


  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {

    if (!this.titles) {
      this.message.error('请输入文案');
      return false;
    }

    let dataValid = true;
    let tip = '';
    const titleList = this.titles.split(/[(\r\n)\r\n]+/); // 根据换行或者回车进行识别
    for (let i = 0; i < titleList.length; i++) {
      if (titleList[i].length) {

        if (this.publisherId != 1 && this.publisherId != 17) {
          const len = getStringLength(titleList[i], this.wordList);
          if (len < 5 || len > 30) {
            dataValid = false;
            tip = '文案长度限制5-30个字';
            break;
          } else {
            if (titleList[i].length) {
              const isCheck = this.materialsService.matchFeedWord(titleList[i], this.wordList);
              if (!isCheck.isMatch) {
                dataValid = false;
                tip = isCheck.tip;
                break;
              }
            }
          }
        } else if(this.publisherId == 17) {
          const len = getStringLength(titleList[i], this.wordList);
          if (len < 10 || len > 45) {
            dataValid = false;
            tip = '文案长度限制10-45个字';
            break;
          } else {
            if (titleList[i].length) {
              const isCheck = this.materialsService.matchOneFeedWord(titleList[i], this.wordList);
              if (!isCheck.isMatch) {
                dataValid = false;
                tip = isCheck.tip;
                break;
              }
            }
          }
        } else {
          const len = getStringLengthBaidu(titleList[i], this.wordList);
          if (len < 1 || len > 60) {
            dataValid = false;
            tip = '文案长度限制1-60个字';
            break;
          }
        }

      }
    }

    if (!dataValid) {
      this.message.error(tip);
      return false;
    }

    if (!this.submit) {
      this.submit = true;

      titleList.forEach(title => {
        if (!this.defaultData.title_list.includes(title) && title.length) {
          this.defaultData.title_list.push(title);
        }
      });

      const body = this.defaultData;
      this.materialsService.addLaunchTitle(body, {cid: this.cid, publisher_id: this.publisherId}).subscribe(result => {
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
