import { Component } from '@angular/core';
import { Title } from "@angular/platform-browser";
import {
  AppstoreOutline, AreaChartOutline, ArrowDownOutline, ArrowsAltOutline, ArrowUpOutline, BarChartOutline, BarsOutline, CaretRightOutline, CheckSquareOutline, CopyOutline, DownloadOutline, EditOutline,
  EyeOutline, FilterOutline, FormOutline, LayoutOutline, LineChartOutline, LockOutline, MinusSquareOutline, PauseOutline, PictureOutline, PieChartOutline, PlusOutline,
  ReloadOutline, SaveOutline, SearchOutline, StarFill, StockOutline, SyncOutline } from '@ant-design/icons-angular/icons';
import { NzIconService } from 'ng-zorro-antd/icon';
import {ProductDataService} from "@jzl/jzl-product";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'app';
  productInfo = {};
  constructor(private _iconService: NzIconService, private titleService: Title, private productService: ProductDataService) {
    this.productService.getDataInfo().then(productInfo => {
      this.productInfo = productInfo;
      this.productService.setProjectClass();
      if (this.productInfo.hasOwnProperty('title')) {
        this.titleService.setTitle(this.productInfo['title']);
      }
    });

    this._iconService.addIcon(...[
      FilterOutline, StarFill, SaveOutline, EyeOutline, PauseOutline, PlusOutline, DownloadOutline, CaretRightOutline, ArrowsAltOutline, CopyOutline, ReloadOutline, EditOutline,
      LineChartOutline, BarsOutline, SyncOutline, PictureOutline, AppstoreOutline, CheckSquareOutline, LockOutline, SearchOutline, MinusSquareOutline, BarChartOutline, LayoutOutline,
      AreaChartOutline, PieChartOutline, ArrowDownOutline, ArrowUpOutline, FormOutline, StockOutline]);
  }
}
