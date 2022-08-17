import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FolderService} from "../service/folder.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import {ActivatedRoute, Router} from "@angular/router";
import {FolderDetailService} from "./service/folder-detail.service";
import {FolderItemService} from "../service/folder-item.service";
import {AuthService} from "../../../core/service/auth.service";

@Component({
  selector: 'app-folder-detail',
  templateUrl: './folder-detail.component.html',
  styleUrls: ['./folder-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ FolderDetailService, FolderItemService, FolderService]
})
export class FolderDetailComponent implements OnInit {

  public folderLevel = 'none';
  public activeType = 'list';
  public folderTab = [
    {'name': '关键词', key: 'list'},
    // {'name': '上传列表', key: 'uploadList'},
    {'name': '高级设置', key: 'setting'}
  ];

  public folderId = '';
  public folderInfo = null;
  constructor(
    private folderService: FolderService,
    private _message: NzMessageService,
    private router: Router,
    private authService: AuthService,
    private  route: ActivatedRoute
  ) {
    this.folderId =  this.route.snapshot.paramMap.get('id');
    this.folderLevel = this.route.snapshot.data['summaryType'];
  }

  changeActive(type) {
    if (this.activeType !== type) {
      this.activeType = type;
    }
  }


  ngOnInit() {
    this.folderTab[0].name = this.folderService.getFolderName(this.folderLevel);
    this.folderService.getOptimizationRefresh().subscribe(
      (item) => {
        if (item) {
          this.getFolderInfo (item);
        }
      }
      );
    this.getFolderInfo(this.folderId);

  }
  getFolderInfo(folderId) {
    this.folderService.getFolderInfo(folderId).subscribe(result => {
      if (result['status_code'] === 200) {
        this.folderInfo = result['data'];
        this.folderService.setOptimizationInfo(result['data']);
      }
    }, error => {

    });
  }

  backList() {
    localStorage.removeItem('edit_state');
    this.authService.setStopBackState('');
    this.router.navigate(['./'],{relativeTo: this.route.parent });
  }
}
