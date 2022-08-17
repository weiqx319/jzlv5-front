import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-gdt-creative-style-show',
  templateUrl: './gdt-creative-style-show.component.html',
  styleUrls: ['./gdt-creative-style-show.component.scss']
})
export class GdtCreativeStyleShowComponent implements OnInit {
  public title = '';
  public imgUrl = '';
  @Input() set row(data) {
    if (data['adcreative_media_details']) {
      const dataTmp = JSON.parse(data['adcreative_media_details']);
      this.title = dataTmp.title;
      if(dataTmp.has_image) {
        const values = Object.values(dataTmp.details);
        let filterList = [];
        if(values.length) {
          filterList =  [...values];
          this.imgUrl = filterList.length? (filterList[0]['image_url']!=undefined?filterList[0]['image_url']:filterList[0]['preview_url']):'';
        }
      }
    }
  }
  constructor() {}

  ngOnInit() {
  }
}
