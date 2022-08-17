
import { Component, Input, OnInit } from '@angular/core';
import {environment} from "../../../../../environments/environment";
import {AuthService} from "../../../../core/service/auth.service";

@Component({
  selector: 'app-material-video',
  templateUrl: './material-video-style.component.html',
  styleUrls: ['./material-video-style.component.scss']
})
export class MaterialVideoStyleComponent implements OnInit {
  public title='';
  public imgList='';
  public imgUrl = '';
  public data={};

  public cid;
  public user_id;

  public isVertical = false;

  @Input() set row(data) {
    this.data = data;
    if(data && data["publisher_id"] == 6) {
      this.title = data['description'];
      if(data['key_frame_image_url']) {
        this.imgUrl = data['key_frame_image_url'];

        if (Number(data.width) < Number(data.height)) {
          this.isVertical = true;
        }
      } else {
        this.title = data['signature'];
        if(data['material_id']) {
          this.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/screenshot/' + data['material_id'] + '?user_id=' + this.user_id + '&cid=' + this.cid + '&last_time=' + data.last_modify_time;

          if (Number(data.upload_video_width) < Number(data.upload_video_height)) {
            this.isVertical = true;
          }
        }
      }


    } else if(data && data["publisher_id"] == 7) {
      this.title = data['signature'];
      if(data['poster_url'] && data['poster_url'] !== '素材所属主体与开发者主体不一致无法获取URL') {
        this.imgUrl = data['poster_url'];

        if (Number(data.width) < Number(data.height)) {
          this.isVertical = true;
        }
      } else {
        this.title = data['signature'];
        if(data['material_id']) {
          this.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/screenshot/' + data['material_id'] + '?user_id=' + this.user_id + '&cid=' + this.cid + '&last_time=' + data.last_modify_time;

          if (Number(data.upload_video_width) < Number(data.upload_video_height)) {
            this.isVertical = true;
          }
        }
      }


    } else {
      this.title = data['signature'];
      if(data['material_id']) {
        this.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/screenshot/' + data['material_id'] + '?user_id=' + this.user_id + '&cid=' + this.cid + '&last_time=' + data.last_modify_time;

        if (Number(data.upload_video_width) < Number(data.upload_video_height)) {
          this.isVertical = true;
        }
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
