import {Component, Input, OnInit} from '@angular/core';
import {deepCopy} from "@jzl/jzl-util";

@Component({
  selector: 'app-byte-dance-creative-style-show',
  templateUrl: './byte-dance-creative-style-show.component.html',
  styleUrls: ['./byte-dance-creative-style-show.component.scss'],
})
export class ByteDanceCreativeStyleShowComponent implements OnInit {
  public title='';
  public imgList=[];
  public data={};
  @Input() set row(data) {
    this.data = data;
    this.title = data['pub_creative_name'];
    if(data['cover_url']) {
      const dataTmp = deepCopy(data['cover_url']);

      if(dataTmp&&dataTmp.length) {
        this.imgList = dataTmp;
      }
    }
  }
  constructor() {}
  public imgClassList = {
    小图: 'small_img',
    大图: 'big_img',
    组图: 'combine_img',
    横版视频: 'horizonta_video',
    大图竖图: 'big_img_vertical',
    竖版视频: 'vertical_video'
  };
  ngOnInit() {
  }
  parseJson(data) {
    return JSON.parse(data);
  }
  getImgClass(name) {
    return this.imgClassList[name];
  }
}
