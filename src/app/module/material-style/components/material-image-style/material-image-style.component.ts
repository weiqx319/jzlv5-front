
import { Component, Input, OnInit } from '@angular/core';
import {environment} from "../../../../../environments/environment";
import {AuthService} from "../../../../core/service/auth.service";

@Component({
  selector: 'app-material-image',
  templateUrl: './material-image-style.component.html',
  styleUrls: ['./material-image-style.component.scss']
})
export class MaterialImageStyleComponent implements OnInit {
  public title='';
  public imgList='';
  public imgUrl = '';
  public data={};

  public cid;
  public user_id;

  public isVertical = false;
  public jzlPreview = true;

  @Input() set row(data) {
    this.data = data;
    this.title = data['signature'];
    this.data = data;
    if(data && data["publisher_id"] == 6 && data['preview_url']) {
      this.title = data['signature'];
      if(data['preview_url']) {
        this.imgUrl = data['preview_url'];
        this.jzlPreview = false;

        if (Number(data.width) < Number(data.height)) {
          this.isVertical = true;
        }
      }

    } else if(data['materialItem'] && data['materialItem']["material_id"] ) {
      this.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/image_material/image/' + data['materialItem']['material_id'] + '?user_id=' + this.user_id + '&cid=' + this.cid;
    } else if(data['material_id']) {
      this.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/image_material/image/' + data['material_id'] + '?user_id=' + this.user_id + '&cid=' + this.cid;

      if (Number(data.upload_video_width) < Number(data.upload_video_height)) {
        this.isVertical = true;
      }
    }
  }


  constructor(private authService: AuthService,) {

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;

  }

  ngOnInit() {
  }


}
