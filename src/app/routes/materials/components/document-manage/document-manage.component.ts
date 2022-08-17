import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-document-manage',
  templateUrl: './document-manage.component.html',
  styleUrls: ['./document-manage.component.scss']
})
export class DocumentManageComponent implements OnInit {

  public activeType = 'document';

  public materialsTab = [
    { 'name': '文案', key: 'document' },
    // {'name': '分组', key: 'group'},
  ];

  constructor() {

  }

  ngOnInit() {
  }

  changeActive(type) {
    if (this.activeType !== type) {
      this.activeType = type;
      // if (this.activeType === 'list' || this.activeType === 'custom') {
      //   this.tableHeight = document.body.clientHeight - 60 - 40 - 36 - 30;
      // } else {
      //   this.tableHeight = document.body.clientHeight - 60 - 40 - 36 - 30;
      // }
      // this.refreshData();
    }
  }

}
