
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-material-video-bytedance',
  templateUrl: './material-video-style-bytedance.component.html',
  styleUrls: ['./material-video-style-bytedance.component.scss']
})
export class MaterialVideoStyleBytedanceComponent implements OnInit {
  public title='';
  public imgList='';
  public imgUrl = '';
  public data={};
  @Input() set row(data) {
    this.data = data;
    this.title = data['signature'];
    this.imgUrl = data['creative_photo_url'];

  }


  constructor() {}

  ngOnInit() {
  }


}
