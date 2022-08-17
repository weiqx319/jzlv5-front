import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from "../../../core/service/http.client";
import { MenuService } from '../../../core/service/menu.service';

@Injectable()
export class ViewChartService {
  constructor(
    private _httpClient: HttpClientService,
    private menuService: MenuService,
  ) {
  }

  getViewChartData(body, params) {
    const isCompany = this.menuService.isCompany;
    const pre_url = isCompany ? '/company' : '';
    const url = `${pre_url}/data_view/chart`;
    return this._httpClient.post(url, body, params);
  }

  // 获取数据分析-图表数据
  getChartData(body: object): Observable<any> {
    let url = '/data_view/chart_analytics?';
    return this._httpClient.post(url, { ...body, data_source: 'condition' });
  }
}
