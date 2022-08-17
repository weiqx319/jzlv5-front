
import { Component, Input, OnInit } from '@angular/core';
import {environment} from "../../../../../environments/environment";
import {AuthService} from "../../../../core/service/auth.service";

@Component({
  selector: 'app-material-video-player',
  templateUrl: './material-video-player.component.html',
  styleUrls: ['./material-video-player.component.scss']
})
export class MaterialVideoPlayerComponent implements OnInit {
  public videoUrl= '';
  public imgUrl = '';

  public cid;
  public user_id;

  public isVertical = false;

  @Input() set material(data) {
    this.videoUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/video/' + data['material_id'] + '?user_id=' + this.user_id + '&cid=' + this.cid;
    this.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/screenshot/' + data['material_id'] + '?user_id=' + this.user_id + '&cid=' + this.cid;

    if (Number(data.upload_video_width) < Number(data.upload_video_height)) {
      this.isVertical = true;
    }
  }


  constructor(private authService: AuthService,) {

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;

  }

  ngOnInit() {
  }


}
