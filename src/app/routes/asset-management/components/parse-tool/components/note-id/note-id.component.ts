import { Component, HostListener, OnInit } from '@angular/core';
import { AssetManagementService } from './../../../../asset-management.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-note-id',
  templateUrl: './note-id.component.html',
  styleUrls: ['./note-id.component.scss']
})
export class NoteIdComponent implements OnInit {
  public queryUrls = '';
  public isParsing = false;
  public dataset: any[] = [[], [], [], [], [], [], [], [], [], []];
  public contextMenu = {
    items: {
      copy: { name: '复制' },
    },
  };
  public tableField = [
    "查询URL",
    "笔记ID",
    "笔记标题",
    "笔记URL",
    "笔记描述",
  ];
  public colWidths = [
    '200',
    '150',
    '200',
    '200',
    '200',
  ];

  constructor(
    private assetManagementService: AssetManagementService,
    private message: NzMessageService,
  ) { }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.resizeHotTable();
  }
  ngOnInit(): void {
    this.resizeHotTable();
  }
  resizeHotTable() {
    setTimeout(() => {
      const wtHeight = document.getElementById('hotTableWrapper').clientHeight - 10;
      const wtHolders = document.getElementsByClassName('wtHolder');
      const ht_clone_left = document.getElementsByClassName('ht_clone_left')[0];
      ht_clone_left['style'].height = wtHeight + 'px';
      for (let i = 0; i < wtHolders.length; i++) {
        wtHolders[i]['style'].height = wtHeight + 'px';
      }

    }, 0);
  }

  rowReadOnly(row, col, prop) {
    const cellProperties = {
      readOnly: true,
    }
    return cellProperties;
  }

  parseUrl() {
    this.isParsing = true;
    const query_urls = this.queryUrls.split('\n');
    this.assetManagementService.explainNote({ query_urls }).subscribe((results: any) => {
      if (results.status_code === 200) {
        this.dataset = [];
        results.data.forEach(item => {
          this.dataset.push([
            item['query_url'],
            item['note_id'],
            item['note_title'],
            item['note_link'],
            item['note_desc'],
          ]);
        });
      } else {
        this.dataset = [[], [], [], [], [], [], [], [], [], []];
        this.message.error(results.message);
      }
      this.isParsing = false;
    },
      (err: any) => {
        this.message.error('数据获取异常，请重试');
        this.isParsing = false;
      },
      () => { },
    );

  }
}
