import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-creative-style-show',
  templateUrl: './creative-style-show.component.html',
  styleUrls: ['./creative-style-show.component.scss']
})
export class CreativeStyleShowComponent implements OnInit {
  public creativeData;
  public title="";
  public brand="";
  public pictures=[];
  @Input() set row(data) {
    this.creativeData = data;
    if(this.creativeData['material']) {
      const tmp = JSON.parse(this.creativeData['material']);
      this.title = tmp['title'];
      this.brand = tmp['brand'];
      this.pictures = tmp['pictures'];
    }
  }
  constructor() { }

  ngOnInit() {
  }

}
