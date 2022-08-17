import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-parse-tool',
  templateUrl: './parse-tool.component.html',
  styleUrls: ['./parse-tool.component.scss']
})
export class ParseToolComponent implements OnInit {
  public sectionTabList = [
    { title: '笔记ID解析工具', url: '/asset_management/parse_tool/note_id' },
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
