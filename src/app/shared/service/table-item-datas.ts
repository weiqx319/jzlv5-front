import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClientService } from "../../core/service/http.client";

@Injectable({
  providedIn: 'root'
})
export class TableItemDatasService {

  constructor(private _httpClient: HttpClientService,) { }

  public AllDefaultTableData: Object;
  public tableItemData: Object;//sem的table-item数据
  public tableItemFeedData: Object;//feed的table-item-feed数据
  public defaultItemFilters: Object;//筛选数据
  public pageViewItemData: Object;//页面数据

  public chartItemNewData: Object;

  public dealDataFunctionList = [
    this.dealDefaultTableData(),
  ];

  async dealDefaultTableData() {
    if (this.AllDefaultTableData) return;
    const result = await this.getDefaultTableData();
    if (result['status_code'] == 200) {
      this.AllDefaultTableData = result['data'];

      this.tableItemData = result['data']['table_item_sem'];
      this.tableItemFeedData = result['data']['table_item_feed'];
      this.defaultItemFilters = result['data']['default_item_filters'];
      this.pageViewItemData = result['data']['page_view_item_data'];
      this.chartItemNewData = result['data']['chartItemNewData'];
    }
  }
  // 获取页面默认数据
  getDefaultTableData() {
    const url = `/define_list/common_setting?host=` + window.location.hostname;
    return this._httpClient.get(url).toPromise();
  }

}
