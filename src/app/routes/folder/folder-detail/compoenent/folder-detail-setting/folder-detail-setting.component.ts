import { Component, OnInit, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import {ActivatedRoute, Router} from "@angular/router";
import {FolderService} from "../../../service/folder.service";

@Component({
  selector: 'app-folder-detail-setting',
  templateUrl: './folder-detail-setting.component.html',
  styleUrls: ['./folder-detail-setting.component.scss']
})
export class FolderDetailSettingComponent implements OnInit {
  private folderInfo: any;
  public folderId = '';
  constructor(
    private folderService: FolderService,
    private _message: NzMessageService,
    private router: Router,
    private  route: ActivatedRoute
  ) {
    this.folderId =  this.route.snapshot.parent.paramMap.get('id');
  }

  public iswraing = false;

  public publisherId = 0;
  public saveing = false;


  public info = {
    "folder_name": '' ,

  };

  ngOnInit() {
    //获取分组信息
    this.folderService.getOptimizationInfo().subscribe(
      result => {
       if (result) {
         this.folderInfo = result;
         this.publisherId = this.folderInfo['publisher_id'] * 1;
         this.info.folder_name = this.folderInfo['folder_name'];

       }

      });



  }

  _save() {
    this.checkPage();
    if ( !this.iswraing) {
      if ( !this.saveing) {
        this.saveing = true;
        this.folderService.heightSetting(this.folderId, this.info).subscribe(
          (result: any) => {
            this.saveing = false;
            if (result.status_code === 200 ) {
              this._message.success( "操作成功");
              this.folderService.setFolderFresh(this.folderId);
            } else if (result['status_code'] && result.status_code === 401) {
              this._message.error('您没权限对此操作！');
            } else if (result['status_code'] && result.status_code === 500) {
              this._message.error('系统异常，请重试');
            } else if (result['status_code'] && result.status_code === 205) {
            } else {
              this._message.error(result.message);
            }
          }, err => {
            this.saveing = false;
          }, () => {
            this.saveing = false;
          }
        );
      }
    }

  }
  checkPage() {

    if (!this.info.folder_name) {
      this.iswraing = true;
    }


  }
}
