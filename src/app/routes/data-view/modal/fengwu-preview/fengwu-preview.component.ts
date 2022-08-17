import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-fengwu-preview',
  templateUrl: './fengwu-preview.component.html',
  styleUrls: ['./fengwu-preview.component.scss']
})
export class FengwuPreviewComponent implements OnInit {

  @Input() data;
  @Input() type='凤舞橱窗';
  public creative_type='windows';

  public typeMap={
    "windows":'凤舞橱窗',
    "guides":'凤舞导航',
    "lists":'凤舞列表',
    "links":'凤舞长子链',
    "sublinks":'凤舞短子链',
    "short_guides":'凤舞短导航',
    "potential":'凤舞寻客',
  };
  public creativeType=[
    { "key": "windows","name": "凤舞橱窗"},
    { "key": "guides","name": "凤舞导航"},
    { "key": "lists","name": "凤舞列表"},
    { "key": "links","name": "凤舞长子链"},
    { "key": "sublinks","name": "凤舞短子链"},
    { "key": "short_guides","name": "凤舞短导航"},
    { "key": "potential","name": "凤舞寻客"},
  ];

  constructor() { }

  ngOnInit(): void {
    const fwType=this.creativeType.find(item=>item.name===this.type);
    this.creative_type=fwType?fwType.key:this.type;
  }

}
