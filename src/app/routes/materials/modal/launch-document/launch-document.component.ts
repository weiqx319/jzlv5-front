import {Component, ElementRef, OnInit, ViewChild, Input} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {MenuService} from "../../../../core/service/menu.service";
import {AuthService} from "../../../../core/service/auth.service";
import {MaterialsService} from "../../service/materials.service";
import {getStringLength, getStringLengthBaidu} from '../../../../shared/util/util';

@Component({
  selector: 'app-launch-document',
  templateUrl: './launch-document.component.html',
  styleUrls: ['./launch-document.component.scss']
})
export class LaunchDocumentComponent implements OnInit {
  @Input() set titleSlt(value) {
    const valueAry = JSON.parse(JSON.stringify(value));
    valueAry.forEach( title => {
      this.documentSltList.push({
        title
      });
      this.documentSltMap[title] = title;
    });
  }
  @Input() publisherId = 7;


  @ViewChild('curTextArea') curTextArea: ElementRef;

  public cursorPosition = 0;
  public titles = '';

  public documentList = [];

  public documentGroupList = [
    {title_group_name: '123', document: []},
  ];

  public documentSltList:any = [];
  public documentSltMap:any = {};

  public wordList = [''];

  public listQueryParams = {
    pConditions: [],
  };

  public queryItem = {
    title: {
      key: 'title',
      name: "文案",
      op: "like",
      value: null
    },
  };

  public documentPage = {
    total: 0,
    loading: false,
    currentPage: 1,
    pageSize: 30,
  };

  public groupPage = {
    total: 0,
    loading: false,
    currentPage: 1,
    pageSize: 30,
  };

  public saveing = false;
  public cid;

  constructor(private message: NzMessageService,
              private menuService: MenuService,
              private modalSubject: NzModalRef,
              private authService: AuthService,
              private materialsService: MaterialsService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.publisherId = this.menuService.currentPublisherId;
  }

  ngOnInit() {
    this.refreshData();
    this.getLaunchTitleWorld();
  }

  refreshData(status?) {
    if (status) {
      this.documentPage.currentPage = 1;
    }

    this.listQueryParams.pConditions = [];
    Object.values(this.queryItem).forEach((item) => {
      if (item.value) {
        this.listQueryParams.pConditions.push(item);
      }
    });

    this.documentPage.loading = true;

    this.materialsService
      .getLaunchTitleList(this.listQueryParams, {
        page: this.documentPage.currentPage,
        count: this.documentPage.pageSize,
        cid: this.cid,
        publisher_id:this.publisherId,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.documentList = [];
            this.documentPage.total = 0;
          } else {
            this.documentList = results['data']['detail'];
            this.documentPage.total = results['data']['detail_count'];
          }
          this.documentPage.loading = false;
        },
        (err: any) => {
          this.documentPage.loading = false;
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
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

  refreshGroupData(status?) {
    if (status) {
      this.groupPage.currentPage = 1;
    }

    this.groupPage.loading = true;

    this.materialsService
      .getLaunchTitleGroupList(this.listQueryParams, {
        page: this.groupPage.currentPage,
        count: this.groupPage.pageSize,
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.documentList = [];
            this.groupPage.total = 0;
          } else {
            this.documentList = results['data']['detail'];
            this.groupPage.total = results['data']['detail_count'];
          }
          this.groupPage.loading = false;
        },
        (err: any) => {
          this.groupPage.loading = false;
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }

  search() {
    this.documentPage.currentPage = 1;
    this.refreshData();
  }

  reset() {
    this.queryItem.title.value = null;
    this.refreshData();
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


  selectDocument(data) {
    // 判断是否存在
    const titleExitAry = this.documentSltList.map(item => item.title);

    if (!titleExitAry.includes(data['title'])) {
      this.documentSltList.push({
        title: data['title']
      });
    }
    this.documentSltMap = {};
    this.documentSltList.map(item=> {
       this.documentSltMap[item.title] = true;
    });
  }

  removeSltItem(index) {
    this.documentSltList.splice(index, 1);
    this.documentSltMap = {};
    this.documentSltList.map(item=> {
      this.documentSltMap[item.title] = true;
    });
  }


  checkSingle(title) {

    setTimeout(()=> {
      let dataValid = true;
      let tip = '';
      const len = this.materialsService.getStringLength(title, this.wordList);
      if (len < 5 || len > 30) {
        dataValid = false;
        tip = '文案长度限制5-30个字';
      } else {
        const isCheck = this.materialsService.matchFeedWord(title, this.wordList);
        if (!isCheck.isMatch) {
          dataValid = false;
          tip = isCheck.tip;
        }
      }
      if (!dataValid) {
        this.message.error(tip);
        return false;
      }

      this.documentSltMap = {};
      this.documentSltList.map(item=> {
        this.documentSltMap[item.title] = true;
      });
    });




  }

  submit() {
    let dataValid = true;
    let tip = '';
    const titleList = this.titles.split(/[(\r\n)\r\n]+/); // 根据换行或者回车进行识别
    for (let i = 0; i < titleList.length; i++) {
      if (titleList[i].length) {

        if(this.publisherId != 1) {
          const len = getStringLength(titleList[i], this.wordList);
          if (len < 5 || len > 30) {
            dataValid = false;
            tip = '文案长度限制5-30个字';
            break;
          } else {
            if (titleList[i].length) {
              let isCheck;
              if(this.publisherId === 17) {
                isCheck = this.materialsService.matchOneFeedWord(titleList[i], this.wordList);
              }  else {
                isCheck = this.materialsService.matchFeedWord(titleList[i], this.wordList);
              }
              if (!isCheck.isMatch) {
                dataValid = false;
                tip = '第'+(i+1)+'行'+isCheck.tip;
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

    if (!dataValid) {
      return;
    }

    titleList.forEach( title => {
      const titleExitAry = this.documentSltList.map(item => item.title);

      if (!titleExitAry.includes(title) && title.length) {
        this.documentSltList.push({
          title
        });
      }
    });
    this.titles="";
    this.documentSltMap = {};
    this.documentSltList.map(item=> {
      this.documentSltMap[item.title] = true;
    });
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    if(this.documentSltList.length > 200) {
      this.message.error('超过标题最大限制200');
      return false;
    }

    const titleAry = this.documentSltList.map(item => item.title);
    this.modalSubject.destroy(titleAry);
  }

}
