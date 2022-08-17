import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { isNull, isUndefined } from "@jzl/jzl-util";
import { DateDefineService } from "../../../../../shared/service/date-define.service";
import { ReportService } from "../../../service/report.service";

@Component({
  selector: 'app-report-table-show',
  templateUrl: './report-table-show.component.html',
  styleUrls: ['./report-table-show.component.scss'],
  providers: [DateDefineService],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ReportTableShowComponent implements OnInit {

  private _timeGrainRelation = {
    summary: '合计',
    day: '分日',
    week: '分周',
    weekSplit: '分星期',
    month: '分月',
  };
  public loadingIndicator = false;
  public tableHeight = 300;
  public rowHeight = 40;
  public rows = [];
  public rowCount = 0;
  public allFilterOption = {};
  public summaryData = {};

  public dataMessages = {
    emptyMessage: `
    <div class="empty-content">
      <span>无可用预览数据，请生成后下载查看</span>
    </div>
  `,
  };

  public tableHeads = [];
  @ViewChild('chkHeader') chkHeader: TemplateRef<any>;
  @ViewChild('filterHeader') filterHeader: TemplateRef<any>;
  @ViewChild('refreshRankingHeader') refreshHeader: TemplateRef<any>;
  @ViewChild('refreshRankingCell') refreshCell: TemplateRef<any>;
  @ViewChild('chkCell') chkCell: TemplateRef<any>;
  @ViewChild('rateCell') rateCell: TemplateRef<any>;
  @ViewChild('rateCellColor') rateCellColor: TemplateRef<any>;
  @ViewChild('cellColor') cellColor: TemplateRef<any>;

  @ViewChild('summaryCell') summaryCell: TemplateRef<any>;
  @ViewChild('summaryCellColor') summaryCellColor: TemplateRef<any>;
  @ViewChild('rateSummaryCell') rateSummaryCell: TemplateRef<any>;
  @ViewChild('rateSummaryCellColor') rateSummaryCellColor: TemplateRef<any>;

  @ViewChild('creativeCell') creativeCell: TemplateRef<any>;
  @ViewChild('starTpl') starTpl: TemplateRef<any>;
  public tableConditionDesc = '';

  @Input() set tableHeightRe(data) {
    if (data) {
      this.tableHeight = data;
    }
  }
  @Output() editTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() runType = 1;
  @Input() set tableSetting(value: any) {
    this.tableHeads = [];
    // if (value.locked_items) {
    //   value.locked_items.forEach(item => {
    //     this.tableHeads.push(item.name);
    //   });
    // }
    // if (value.selected_items) {
    //   value.selected_items.forEach(item => {
    //     this.tableHeads.push(item.name);
    //   });
    // }
    if (!isUndefined(value) && !isUndefined(value.selected_items) && !isUndefined(value.locked_items)) {
      this.refreshFields(value.selected_items, value.locked_items);
      if (this.runType != 2) {
        this.refreshData(value);
      }

    }

    // -- 处理描述时间
    this.tableConditionDesc = '时间：' + this.getDateDesc(value.summary_date);
    if (value.is_compare) {
      this.tableConditionDesc += '对比' + this.getDateDesc(value.summary_date_compare);
    }
    this.tableConditionDesc += ', 汇总方式：' + this._timeGrainRelation[value.time_grain];

  }

  constructor(private dateDefineService: DateDefineService, private reportService: ReportService) { }

  ngOnInit() {
  }

  editTable(): void {
    this.editTableData.emit();
  }

  public getDateDesc(dateStr): any {
    if (isUndefined(dateStr)) { return ''; }
    if (dateStr.indexOf('custom') === 0) {
      const timeArr = dateStr.split(':');
      return timeArr[1] + '至' + timeArr[2];
    } else {
      return this.dateDefineService.getDateNameByKey(dateStr);
    }
  }

  refreshFields(data: any[], lockedData: any[]) {
    const tmpFiled: any = [];
    data.forEach((item) => {
      let popKey = item.key;
      if (item.hasOwnProperty('showKey') && item.showKey !== '') {
        popKey = item.showKey;
      }
      const tplHeader = {};
      if (item['is_rate']) {
        tplHeader['cellTemplate'] = this.rateCell;
      }
      if (item.hasOwnProperty('sortable')) {
        tplHeader['sortable'] = item.sortable;
      }

      if (item.type && item.type === 'number') {
        tplHeader['cellClass'] = 'num_right';
        tplHeader['headerClass'] = 'header_right';
      }

      if (popKey === 'wap_quality' || popKey === 'pc_quality') {
        tplHeader['cellTemplate'] = this.starTpl;
      }
      if (this.allFilterOption.hasOwnProperty(popKey)) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['data'] = this.allFilterOption[popKey];
      }
      if (item.selected && item.selected['current']) {
        // {"prop": "pub_keyword_id", name: '关键词'},
        if (item.type && item.type === 'number') {
          tplHeader['summaryFunc'] = () => this.summaryData[popKey];
          tplHeader['summaryTemplate'] = this.summaryCell;
          if (item['is_rate']) {
            tplHeader['summaryTemplate'] = this.rateSummaryCell;
          }
        }
        if (popKey === 'ranknow') {
          tplHeader['headerTemplate'] = this.refreshHeader;
          tplHeader['cellTemplate'] = this.refreshCell;
        }

        tmpFiled.push({ prop: popKey, name: item.name, resizeable: true, width: item.width, ...tplHeader });
      }
      if (item.selected && item.selected['compare']) {
        tplHeader['summaryFunc'] = () => this.summaryData[popKey + '_cmp'];
        tplHeader['summaryTemplate'] = this.summaryCell;
        if (item['is_rate']) {
          tplHeader['summaryTemplate'] = this.rateSummaryCell;
        }
        if (this.allFilterOption.hasOwnProperty(popKey)) {
          if (this.allFilterOption.hasOwnProperty(popKey + '_cmp')) {
            tplHeader['data'] = this.allFilterOption[popKey + '_cmp'];
          } else {
            this.allFilterOption[popKey + '_cmp'] = {
              filterType: 'numberFilter',
              filterOption: [],
              filterKey: { key: popKey + '_cmp', data_type: item.data_type, name: item.name + '#', type: 'numberFilter' },
              filterResult: {},
            };
            tplHeader['data'] = this.allFilterOption[popKey + '_cmp'];
          }
        }

        tmpFiled.push({ prop: popKey + '_cmp', draggable: false, name: item.name + '#', resizeable: true, width: item.width, ...tplHeader });
      }
      if (item.selected && item.selected['compare_abs']) {
        if (item['is_rate']) {
          tplHeader['cellTemplate'] = this.rateCellColor;
          tplHeader['summaryTemplate'] = this.rateSummaryCellColor;
        } else {
          tplHeader['cellTemplate'] = this.cellColor;
          tplHeader['summaryTemplate'] = this.summaryCellColor;
        }
        tplHeader['summaryFunc'] = () => this.summaryData[popKey + '_abs'];

        if (this.allFilterOption.hasOwnProperty(popKey)) {
          if (this.allFilterOption.hasOwnProperty(popKey + '_abs')) {
            tplHeader['data'] = this.allFilterOption[popKey + '_abs'];
          } else {
            this.allFilterOption[popKey + '_abs'] = {
              filterType: 'numberFilter',
              filterOption: [],
              filterKey: { key: popKey + '_abs', data_type: item.data_type, name: item.name + '△', type: 'numberFilter' },
              filterResult: {},
            };
            tplHeader['data'] = this.allFilterOption[popKey + '_abs'];
          }
        }

        tmpFiled.push({ prop: popKey + '_abs', draggable: false, name: item.name + '△', resizeable: true, width: item.width, ...tplHeader });
      }
      if (item.selected && item.selected['compare_rate']) {
        tplHeader['cellTemplate'] = this.rateCellColor;
        tplHeader['summaryFunc'] = () => this.summaryData[popKey + '_rat'];
        tplHeader['summaryTemplate'] = this.rateSummaryCellColor;

        if (this.allFilterOption.hasOwnProperty(popKey)) {
          if (this.allFilterOption.hasOwnProperty(popKey + '_rat')) {
            tplHeader['data'] = this.allFilterOption[popKey + '_rat'];
          } else {
            this.allFilterOption[popKey + '_rat'] = {
              filterType: 'numberFilter',
              filterOption: [],
              filterKey: { key: popKey + '_rat', data_type: item.data_type, name: item.name + '%', type: 'numberFilter' },
              filterResult: {},
            };
            tplHeader['data'] = this.allFilterOption[popKey + '_rat'];
          }
        }
        tmpFiled.push({ prop: popKey + '_rat', draggable: false, name: item.name + '%', resizeable: true, width: item.width, cellTemplate: this.rateCell, ...tplHeader });
      }
    });
    const lockedColumn = [];
    lockedData.forEach((item) => {
      let popKey = item.key;
      if (item.hasOwnProperty('showKey') && item.showKey !== '') {
        popKey = item.showKey;
      }
      const tplHeader = {};
      if (popKey === 'pub_creative_title') {
        tplHeader['cellTemplate'] = this.creativeCell;
      }
      if (this.allFilterOption.hasOwnProperty(popKey)) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['data'] = this.allFilterOption[popKey];
      }
      if (lockedColumn.length === 0) {
        tplHeader['summaryFunc'] = () => "合计";
      }

      lockedColumn.push({ prop: popKey, name: item.name, frozenLeft: true, width: item.width, ...tplHeader });
    });

    this.tableHeads = [...lockedColumn, ...tmpFiled];

  }

  refreshData(viewTableData) {
    this.allFilterOption = { ...this.allFilterOption };
    this.loadingIndicator = true;
    const tmpViewTableData = JSON.parse(JSON.stringify(viewTableData));
    tmpViewTableData['selected_items'].push({ data_type: 'pub_attr_data', key: 'publisher_id', showKey: 'publisher', selected: { current: true } });
    const postData = { sheets_setting: { table_setting: tmpViewTableData } };
    this.reportService.getReportViewData(postData, {
      count: 20,
      page: 1,
    }).subscribe(
      (results: any) => {
        if (results.status_code && results.status_code === 200) {
          this.loadingIndicator = false;
          this.rows = results['data']['detail'];
          this.rowCount = this.rows.length;
        }
      },
      (err: any) => {
        this.loadingIndicator = false;
      },
      () => {
        this.loadingIndicator = false;
      });
  }

}
