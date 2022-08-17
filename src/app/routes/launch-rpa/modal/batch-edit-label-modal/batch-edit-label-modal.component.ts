import {Component, Input, OnInit} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {MenuService} from '../../../../core/service/menu.service';
import {AuthService} from '../../../../core/service/auth.service';
import {LaunchRpaService} from '../../service/launch-rpa.service';

@Component({
  selector: 'app-batch-edit-label-modal',
  templateUrl: './batch-edit-label-modal.component.html',
  styleUrls: ['./batch-edit-label-modal.component.scss']
})
export class BatchEditLabelModalComponent implements OnInit {

  constructor(private message: NzMessageService,
              private menuService: MenuService,
              private modalSubject: NzModalRef,
              private authService: AuthService,
              public launchRpaService: LaunchRpaService,) {

  }

  @Input() labelType   = 'title';
  @Input() materialIds = [];
  @Input() selectedData = {
    selected_type: 'current',
    selected_data: [],
    selected_data_ids: [],
    selected_length: 0,
    sheets_setting: {}
  };
  @Input() publisherId = 7;

  public saving = false;
  public tagsList= [];
  public include_material_tags = [];
  public exclude_material_tags = [];

  ngOnInit() {
    this.getTagsList();
  }


  doCancel() {
    this.modalSubject.destroy({result:'cancel',data:[]});
  }

  doSave() {

    if(this.include_material_tags.length <1 && this.exclude_material_tags.length < 1) {
      this.message.error('请填写标签');
      return;
    }


    let postData:any = {};
    postData['select_type'] = 'current';
    postData['sheets_setting'] = {};
    if(this.labelType == 'title') {
      postData = {
        "title_ids": this.selectedData.selected_data_ids,
        "publisher_id": this.publisherId,
        title_tags:[],
      };
      if(this.include_material_tags.length >0) {
        postData.title_tags.push({
          "is_edit": true,
          "modify_type": "add",
          "value":this.include_material_tags
        });
      }

      if(this.exclude_material_tags.length >0) {
        postData.title_tags.push({
          "is_edit": true,
          "modify_type": "delete",
          "value":this.exclude_material_tags
        });
      }

    } else {
      postData = {
        "material_ids": this.selectedData.selected_data_ids,
        "publisher_id": this.publisherId,
        material_tags:[],
      };
      if(this.include_material_tags.length >0) {
        postData.material_tags.push({
          "is_edit": true,
          "modify_type": "add",
          "value":this.include_material_tags
        });
      }

      if(this.exclude_material_tags.length >0) {
        postData.material_tags.push({
          "is_edit": true,
          "modify_type": "delete",
          "value":this.exclude_material_tags
        });
      }
    }

    if(this.selectedData.selected_type == 'all') {
      postData['select_type'] = 'all';
      postData['sheets_setting'] = this.selectedData['sheets_setting'];
    }




    this.launchRpaService.modifyLabel(this.labelType,postData).subscribe(result=> {
      if (result.status_code !== 200) {
        this.message.error(result.message);
      } else {
        this.modalSubject.destroy({result:'ok',data:[]});
        this.message.success('编辑成功');
      }
    });


  }


  getTagsList() {
    this.launchRpaService.getLabelByLaunchType(this.labelType).subscribe(results=> {
      if (results.status_code && results.status_code === 200) {
        this.tagsList = results['data'];
      } else {
        this.tagsList = [];
      }
    });
  }

}
