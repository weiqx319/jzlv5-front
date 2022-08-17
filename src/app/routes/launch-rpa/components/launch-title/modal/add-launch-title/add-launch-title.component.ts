import {Component, ElementRef, OnInit, ViewChild, Input} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {MenuService} from '../../../../../../core/service/menu.service';
import {AuthService} from '../../../../../../core/service/auth.service';

import {getStringLength, getStringLengthNew} from '../../../../../../shared/util/util';
import {LaunchRpaService} from '../../../../service/launch-rpa.service';


@Component({
  selector: 'app-launch-title',
  templateUrl: './add-launch-title.component.html',
  styleUrls: ['./add-launch-title.component.scss']
})
export class AddLaunchTitleComponent implements OnInit {
  @Input() publisherId=7;
  @Input() chan_pub_id;


  @ViewChild('curTextArea') curTextArea: ElementRef;

  public cursorPosition = 0;
  public titles = '';

  public documentSltList:any = [];
  public documentSltMap:any = {};
  public wordList = [''];

  public titleErrorStatus = false;
  public checkTitleErrorList = [];

  public defaultData = {
    publisher_id: 7,
    title_list: [], // 文案
    title_tags:[],
  };

  public tagList = [];

  public saveing = false;
  public cid;
  public wordTypeData;

  constructor(private message: NzMessageService,
              private menuService: MenuService,
              private modalSubject: NzModalRef,
              private authService: AuthService,
              public launchRpaService: LaunchRpaService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.publisherId = this.menuService.currentPublisherId;
    this.wordTypeData = this.launchRpaService.titleWordType['publisher_' + this.publisherId];
  }

  ngOnInit() {
    if (this.publisherId==16) {
      this.getCreativeWordList();
    } else if (this.publisherId==23){
      this.getJinNiuWordList();
    } else {
      this.getLaunchTitleWorld();
    }
  }


  getLaunchTitleWorld() {
    this.launchRpaService
      .getLaunchRpaTitleWorld({
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
          }},
        (err: any) => {
          this.message.error('数据获取异常，请重试');},
        () => {},
      );
  }

  getCreativeWordList() {
    this.launchRpaService
      .getCreativeWordList({
        cid: this.cid,
        publisher_id:this.publisherId,
        chan_pub_id:this.chan_pub_id,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            const list = results['data'];
            this.wordList=[];
            list.forEach(item=> {
              this.wordList.push(item.name);
            });

          } else if (results.status_code && results.status_code === 205) {

          } else {
            this.message.error(results.message);
          }},
        (err: any) => {
          this.message.error('数据获取异常，请重试');},
        () => {},
      );
  }
  getJinNiuWordList() {
    this.launchRpaService.getJinNiuWordList().subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            const list = results['data'];
            this.wordList=[];
            list.forEach(item=> {
              this.wordList.push(item.classify);
            });

          } else if (results.status_code && results.status_code === 205) {

          } else {
            this.message.error(results.message);
          }},
        (err: any) => {
          this.message.error('数据获取异常，请重试');},
        () => {},
      );
  }


  addTags(value) {
    const tagValueLength = value.length + 2;

    const curInput = this.curTextArea.nativeElement;
    this.cursorPosition = curInput.selectionStart;

    const stringObj = this.launchRpaService.getStringByPosition(curInput.selectionStart, curInput.selectionEnd, curInput.value);
    this.titles = stringObj.startStr + '{' + value + '}' + stringObj.endStr;

    curInput.value = this.titles;

    this.cursorPosition += tagValueLength;

    if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核

    } else {
      curInput.select();
      curInput.selectionStart = this.cursorPosition;
      curInput.selectionEnd = this.cursorPosition;
    }
  }

  checkTitle() {
    this.titleErrorStatus = true;
    let tip = '';
    this.checkTitleErrorList = [];
    const titleList = this.titles.split(/[(\r\n)\r\n]+/); // 根据换行或者回车进行识别
    for (let i = 0; i < titleList.length; i++) {
      if (titleList[i].length) {
        let len = getStringLength(titleList[i], this.wordList);
        if (this.publisherId===17) {
          len = getStringLengthNew(titleList[i], this.wordList);
          const specTip=this.checkSpecialChar(titleList[i]);
          if (typeof specTip === 'string') {
            tip = '第'+(i+1)+'行 '+ titleList[i]+specTip;
            this.checkTitleErrorList.push(tip);
          }
        }
        if (len < this.wordTypeData.min_length || len > this.wordTypeData.max_length) {
          tip = '第'+(i+1)+'行 '+ titleList[i] + ':文案长度限制' + this.wordTypeData.min_length + '-' + this.wordTypeData.max_length + '个字';
          this.checkTitleErrorList.push(tip);
        } else {
          if(this.publisherId!==23){
            if (titleList[i].length) {
              const isCheck  = this.launchRpaService.matchFeedWord(titleList[i], this.wordList,this.wordTypeData.word_num);
              if (!isCheck.isMatch) {
                tip = '第'+(i+1)+'行 '+ titleList[i] + ':' + isCheck.tip;
                this.checkTitleErrorList.push(tip);
              }
            }
          }
        }
      }
    }
    if(this.checkTitleErrorList.length ==  0 ) {
      this.titleErrorStatus = false;
    }
  }

  checkSpecialChar(text) {
    var t;
    if (text) {
      t =text.match(/[ˉˇ\xa8〃々～‖〈〉「」『』〖〗【】＇＜＞＠［＼］＾＿｀｛｜｝\xb1\xf7∧∨∑∏∪∩∈∷√⊥∥∠⌒⊙∫∮≡≌≈∽∝≠≮≯≤≥∞∵∴♂♀\xb0′″℃＄\xa4￠￡‰\xa7№#@%*▽▼⊙\xa4◥╋◤▓╬℡┏┓┌┐≮☆★○●◎◇◆□■△▲※→←↑↓〓ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹ⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇①②③④⑤⑥⑦⑧⑨⑩㈠㈡㈢㈣㈤㈥㈦㈧㈨㈩ΓΔΘΛΞΟΠΣΦΨΩ︵︶︹︺︿﹀︽︾﹁﹂﹃﹄︻︼︷︸︱︳︴БГДЁЖЗИЙЛПФЦЧШЩЪЫЬЭЮЯабвгдеёжзийклпцчшщэюя㊣]/gi);
    }
    return !t || "不可包含特殊字符" + t.join(" ");
  }

  doCancel() {
    this.modalSubject.destroy({result:'cancel',data:[]});
  }

  doSave() {
     this.checkTitle();
     if(this.titleErrorStatus) {
       return ;
     }
     const titleList = this.titles.split(/[(\r\n)\r\n]+/);
     const tmpTileList = [];
     titleList.forEach(title=> {
       if(title.trim() != '') {
         tmpTileList.push(title);
       }
     });
     if(tmpTileList.length < 1) {
      this.message.error("请添加标题");
      return;
    }

     this.defaultData.title_list = tmpTileList;
     const body = this.defaultData;
     body.publisher_id=this.publisherId;
     this.launchRpaService.addLaunchTitle(body, {cid: this.cid, publisher_id: this.publisherId}).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.message.success('操作成功');
        this.modalSubject.destroy({result:'ok',data:tmpTileList});
      } else if (result.status_code && result.status_code === 205) {

      } else {
        this.message.error(result.message);
      }

    }, err => {
    });


  }

}
