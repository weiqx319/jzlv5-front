import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {MaterialsService} from "../../service/materials.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {AuthService} from "../../../../core/service/auth.service";
import {CustomDatasService} from "../../../../shared/service/custom-datas.service";
import {getStringLength, getStringLengthBaidu} from '../../../../shared/util/util';

@Component({
  selector: 'app-add-document-modal',
  templateUrl: './add-document-modal.component.html',
  styleUrls: ['./add-document-modal.component.scss']
})
export class AddDocumentModalComponent implements OnInit {
  @ViewChild('inputBox') inputBox: ElementRef;

  @Input() publisherId;
  public defaultData = {
    publisher_id: 7,
    title_list: [], // 文案
  };



  public titleList = [
    {
      title: '',
      len: 0,
    }
  ];
  public wordList = [];
  public currentIndex = 0;
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
    if(this.publisherId !=1) {

      this.materialsService
        .getLaunchTitleWorld({
          page: 1,
          count: 10000000,
          cid: this.cid,
          publisher_id:this.publisherId
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
          () => {},
        );
    } else {

      this.materialsService
        .getLaunchTitleWorldBaidu({
          page: 1,
          count: 10000000,
          cid: this.cid,
          publisher_id:this.publisherId
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
          () => {},
        );
    }


  }

  titleChange(data) {

    if(this.publisherId != 1) {
      data.len = getStringLength(data.title, this.wordList);
    } else {
      data.len = getStringLengthBaidu(data.title, this.wordList);
    }

  }

  getCurrentFocus(index) {
    this.currentIndex = index;
  }

  addTags(value) {

    if(this.publisherId!=1 && this.publisherId!=17) {
      if (this.titleList[this.currentIndex].title.length) {
        const isCheck = this.materialsService.matchFeedWord(this.titleList[this.currentIndex].title, this.wordList, true);
        if (isCheck.isOver) {
          this.message.error('每条文案只能包含两个公共词包');
          return;
        }
      }


      const tagValueLength = value.length + 2;

      const curInput = this.inputBox.nativeElement.querySelectorAll('.ipts')[this.currentIndex];
      this.cursorPosition = curInput.selectionStart;

      const stringObj = this.materialsService.getStringByPosition(curInput.selectionStart, curInput.selectionEnd, curInput.value);
      this.titleList[this.currentIndex].title = stringObj.startStr + '{' + value + '}' + stringObj.endStr;
      curInput.value = this.titleList[this.currentIndex].title;

      this.titleChange(this.titleList[this.currentIndex]);

      this.cursorPosition += tagValueLength;

      if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核

      } else {
        curInput.select();
        curInput.selectionStart = this.cursorPosition;
        curInput.selectionEnd = this.cursorPosition;
      }
    } else if(this.publisherId==17) {
      if (this.titleList[this.currentIndex].title.length) {
        const isCheck = this.materialsService.matchOneFeedWord(this.titleList[this.currentIndex].title, this.wordList, true);
        if (isCheck.isOver) {
          this.message.error('每条文案只能包含一个公共词包');
          return;
        }
      }


      const tagValueLength = value.length + 2;

      const curInput = this.inputBox.nativeElement.querySelectorAll('.ipts')[this.currentIndex];
      this.cursorPosition = curInput.selectionStart;

      const stringObj = this.materialsService.getStringByPosition(curInput.selectionStart, curInput.selectionEnd, curInput.value);
      this.titleList[this.currentIndex].title = stringObj.startStr + '{' + value + '}' + stringObj.endStr;
      curInput.value = this.titleList[this.currentIndex].title;

      this.titleChange(this.titleList[this.currentIndex]);

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

      const curInput = this.inputBox.nativeElement.querySelectorAll('.ipts')[this.currentIndex];
      this.cursorPosition = curInput.selectionStart;

      const stringObj = this.materialsService.getStringByPosition(curInput.selectionStart, curInput.selectionEnd, curInput.value);
      this.titleList[this.currentIndex].title = stringObj.startStr + '#{' + resultValue + '}' + stringObj.endStr;
      curInput.value = this.titleList[this.currentIndex].title;

      this.titleChange(this.titleList[this.currentIndex]);

      this.cursorPosition += tagValueLength;

      if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核

      } else {
        curInput.select();
        curInput.selectionStart = this.cursorPosition;
        curInput.selectionEnd = this.cursorPosition;
      }
    }



  }

  removeItem(index) {
    this.titleList.splice(index, 1);

    if (this.currentIndex >= this.titleList.length) {
      this.currentIndex = 0;
    }
  }

  addItem(index) {
    const item = {
      title: '',
      len: 0,
    };
    this.titleList.splice(index + 1, 0, item);
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    let dataValid = true;
    let tip = '';
    if(this.publisherId!=1  && this.publisherId != 17) {
      for (let i = 0; i < this.titleList.length; i++) {
        if (this.titleList[i].len < 5 || this.titleList[i].len > 30) {
          dataValid = false;
          tip = '文案长度限制5-30个字';
          break;
        } else {
          if (this.titleList[i].title.length) {
            const isCheck = this.materialsService.matchFeedWord(this.titleList[i].title, this.wordList);
            if (!isCheck.isMatch) {
              dataValid = false;
              tip = isCheck.tip;
              break;
            }
          }
        }
      }

      if (!dataValid) {
        this.message.error(tip);
        return false;
      }
    } else if(this.publisherId == 17) {
      for (let i = 0; i < this.titleList.length; i++) {
        if (this.titleList[i].len < 10 || this.titleList[i].len > 45) {
          dataValid = false;
          tip = '文案长度限制10-45个字';
          break;
        } else {
          if (this.titleList[i].title.length) {
            const isCheck = this.materialsService.matchOneFeedWord(this.titleList[i].title, this.wordList);
            if (!isCheck.isMatch) {
              dataValid = false;
              tip = isCheck.tip;
              break;
            }
          }
        }
      }

      if (!dataValid) {
        this.message.error(tip);
        return false;
      }
    } else {
      for (let i = 0; i < this.titleList.length; i++) {
        if (this.titleList[i].len < 1 || this.titleList[i].len > 60) {
          dataValid = false;
          tip = '文案长度限制1-60个字';
          break;
        }
      }

      if (!dataValid) {
        this.message.error(tip);
        return false;
      }
    }



    if (!this.submit) {
      this.submit = true;
      this.defaultData.title_list = this.titleList.map(title => title.title);

      const body = this.defaultData;
      this.materialsService.addLaunchTitle(body, {cid: this.cid,publisher_id:this.publisherId}).subscribe(result => {
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
