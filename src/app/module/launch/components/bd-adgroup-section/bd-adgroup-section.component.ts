import {Component, Input, OnInit, ViewEncapsulation, SimpleChanges, OnChanges, AfterViewChecked} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../core/service/auth.service";
import {LaunchService} from "../../service/launch.service";
import {Subject, zip} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

@Component({
  selector: 'app-bd-adgroup-section',
  templateUrl: './bd-adgroup-section.component.html',
  styleUrls: ['./bd-adgroup-section.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BdAdgroupSectionComponent implements OnInit, OnChanges, AfterViewChecked {

  @Input() data: any = {};
  @Input() errorTip;
  @Input() chan_pub_id;
  @Input() structConfig;
  @Input() campaignTypeSetting;
  @Input() flowRange:any = [];
  @Input() positionInfo:any ={};

  public conversionNameList = []; // 转化名称
  public transTypeList = []; // 目标转化
  public deepTransTypesList = []; // 深度转化
  public catalogueList = []; // 商品目录
  public goodsGroupList = []; // 商品组

  private searchText$ = new Subject<any>();

  public groupFilter = [
    {
      field: null,
      operation: null,
      value: [],
      conditionList: [],
      valueList: [],
    }
  ];
  public filterConditionList = []; // 筛选条件
  public isCatalogIdChanged = false;

  public is_save_group = false;
  public group_name = ''; // 商品组名
  public oldGroupName;

  public lpUrlList: any = {};

  public showCoefficient = false;

  public cid;

  constructor(
    private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private launchService: LaunchService,
    private authService: AuthService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.getDownloadLinkUrl();
    this.getconversionNameList();
    this.getCatalogueList();
    if(this.data.catalog_id) {
      this.getDataByCatalogue(false,true);
    }

    this.initSearchUserSubscription();



  }

  ngAfterViewChecked() {

  }


  private initSearchUserSubscription() {
    this.searchText$.pipe(
      debounceTime(800),
      distinctUntilChanged())
      .subscribe((searchData) => {
        this.getFilterResultServerSearch(searchData['condition'],searchData['search']);
      });
    
  }


// 获取商品目录
  getCatalogueList() {
    this.launchService
      .getCatalogueList({cid: this.cid})
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code !== 200) {

          } else {
            this.catalogueList = [];
            this.catalogueList = JSON.parse(JSON.stringify(results));
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }

  // 获取商品目录ID 配置
  getDataByCatalogue(isNotEmpty?,init?) {
    if(!init) {
      if (isNotEmpty) {
        this.launchService.goodsGroupListByCatalogue[this.data.catalog_id] = undefined;
      } else {
        this.data.group_id = null;
        this.group_name = null;
        this.is_save_group = false;
        this.goodsGroupList = [];
        this.filterConditionList = [];
        this.data.rule_products = [
          {
            field: null,
            operation: null,
            value: [],
            conditionList: [],
            valueList: [],
          }
        ];
      }
    }


    const getGoodsGroupList = this.launchService.getGoodsGroupListByCatalogue({
      catalogue_id: this.data.catalog_id,
      cid: this.cid,
    });

    const getFilterCondition = this.launchService.getFilterConditionByCatalogue({
      chan_pub_id: this.chan_pub_id,
      catalogue_id: this.data.catalog_id,
      cid: this.cid,
    });

    zip(getGoodsGroupList, getFilterCondition).subscribe(([goodsGroupList, filterCondition]) => {

      if (goodsGroupList['status_code'] && goodsGroupList['status_code'] === 200) {
        this.goodsGroupList = JSON.parse(JSON.stringify(goodsGroupList['data']));
      }

      if (filterCondition['status_code'] && filterCondition['status_code'] === 200) {
        this.filterConditionList = JSON.parse(JSON.stringify(filterCondition['data']));
      }

    }, (err) => {

    });

  }

  getFilterResult(condition) {
    this.launchService
      .getFilterResult({
        chan_pub_id: this.chan_pub_id,
        condition_setting: {
          left_filter: condition.field,
          condition: condition.operation,
          right_filter: ""
        },
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code !== 200) {

          } else {
            condition.valueList = JSON.parse(JSON.stringify(results['data']));
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }

  getFilterResultServerSearch(condition,searchText) {
    this.launchService
      .getFilterResultSearch({
        chan_pub_id: this.chan_pub_id,
        condition_setting: {
          left_filter: condition.field,
          condition: 'CONTAIN',
          right_filter: searchText
        },
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code !== 200) {

          } else {
            condition.valueList = JSON.parse(JSON.stringify(results['data']));
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }



  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.getconversionNameList();
    }
  }

  getDownloadLinkUrl() {
    this.launchService
      .getAppTypeUrlList({
        result_model: 'all',
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {

          if (results.status_code &&　results.status_code !== 200) {
            if (results.status_code !== 205) {
              this.message.error(results.message);
            }
          } else {
            this.lpUrlList = {...results};
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }

  // 获取转化名称列表
  getconversionNameList(isEmpty?) {
    // 清空转化名称
    if (isEmpty) {
      this.data.convert_id = null;
      this.conversionNameList = [];
    }


    if (this.chan_pub_id === undefined) {
      return;
    }

    const params = {
      chan_pub_id: this.chan_pub_id,
    };

    if (!params.chan_pub_id) {
      this.data.convert_id = null;
      this.conversionNameList = [];
      return;
    }

    this.launchService
      .getConversionNameList(params)
      .subscribe(
        (results: any) => {

          if (results.status_code && results.status_code !== 200) {

          } else {
            this.conversionNameList = results['data'];
            if(this.data.app_trans_id) {
              this.appTransIdChange(this.data.app_trans_id,true);
            }

          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }

  // 转化名称 --- change
  appTransIdChange(event,init=false) {
    this.transTypeList = [];
    const transTypeAry = [];

    this.deepTransTypesList = [];
    const deepTransTypesAry = [];

    if(!init) {
      this.data.deep_trans_type = null;
      this.data.deep_ocpc_bid = null;
      this.data.trans_type = null;
    }


    const filterItem = this.conversionNameList.filter( item => item.app_trans_id === event);
    if (filterItem.length) {
      this.data.trans_from = filterItem[0].trans_from;

      // 目标转化列表
      if (filterItem[0].trans_types) {
        Object.keys(filterItem[0].trans_types).map((v)=> {
          transTypeAry.push({"key": Number(v), "name": filterItem[0].trans_types[v]});
        });
      }

      // 深度转化列表
      if (filterItem[0].deep_trans_types) {
        Object.keys(filterItem[0].deep_trans_types).map((v)=> {
          deepTransTypesAry.push({"key": Number(v), "name": filterItem[0].deep_trans_types[v]});
        });
      }

    }

    this.transTypeList = [...transTypeAry];
    this.deepTransTypesList = [...deepTransTypesAry];

    if (!this.deepTransTypesList.length) {
      this.data.optimize_deep_trans = 0;
    }
  }

  // 商品目录ID
  catalogIdChanged() {
    this.isCatalogIdChanged = true;
  }

  catalogIdBlur() {
    if (!this.isCatalogIdChanged) {
      return;
    }
    this.getDataByCatalogue();
    this.isCatalogIdChanged = false;
  }


  urlClick(key,data) {
    this.data[key] = data.app_url;
  }

  catalogSelect(data) {
    this.data.catalog_id = data.catalogue_id;
    this.getDataByCatalogue();
    // this.getconversionNameList(true);
  }

  groupIdChange(event) {
    const filterItem = this.goodsGroupList.filter( item => item.group_id === event);
    if (filterItem.length) {
      this.group_name = filterItem[0].group_name;
      this.oldGroupName = this.group_name;
      const group_filter = JSON.parse(filterItem[0].group_filter);

      const filterAry = [];
      group_filter.forEach( filter => {
        const curFilter = {
          field: filter.field,
          operation: filter.operation,
          value: filter.value,
          conditionList: [],
          valueList: [],
        };

        this.conditionFieldChange(filter.field, curFilter, true);
        this.conditionOperationChange(curFilter, true);

        filterAry.push(curFilter);
      });
      if (filterAry.length) {
        this.data.rule_products = [...filterAry];
      }
    }
  }

  conditionFieldChange(event, curCondition, isNotEmpty?) {
    if (!isNotEmpty) {
      curCondition.operation = null;
      curCondition.value = [];
      curCondition.conditionList = [];
      curCondition.valueList = [];
    }

    const filterItem = this.filterConditionList.filter( item => item.value === event);
    if (filterItem.length) {
      curCondition.conditionList = JSON.parse(JSON.stringify(filterItem[0]['conditions']));
    }
  }

  conditionOperationChange(curCondition, isNotEmpty?) {
    if (!isNotEmpty) {
      curCondition.value = [];
      curCondition.valueList = [];
    }
    this.getFilterResult(curCondition);
  }

  deleteConditionValue(idx, curValue) {
    curValue.splice(idx, 1);
    
  }

  onSearch(condition,event) {
    this.searchText$.next({'condition':condition,'search':event});

  }



  addGroupFilter(idx) {
    if (this.data.rule_products.length >= 3) {
      this.message.error('最多增加3个筛选条件');
      return false;
    }

    const item = {
      field: null,
      operation: null,
      value: [],
      conditionList: [],
      valueList: [],
    };
    this.data.rule_products.splice(idx + 1, 0, item);
  }

  removeGroupFilter(idx) {
    this.data.rule_products.splice(idx , 1);
  }

  doSaveFilterCondition() {
    if (this.group_name.length < 1 || this.group_name.length > 40) {
      this.message.error('商品组名应为1-40字');
      return false;
    }

    const groupFilter = [];

    let isValid = false;
    for (let i = 0; i < this.data.rule_products.length; i++) {
      const curItem = this.data.rule_products[i];
      if (!curItem.field || !curItem.operation || !curItem.value.length) {
        isValid = true;
        break;
      } else {
        groupFilter.push({
          field: curItem.field,
          operation: curItem.operation,
          value: curItem.value
        });
      }
    }

    if (isValid) {
      this.message.error('请完善筛选条件');
      return false;
    }

    const groupNameMap = this.goodsGroupList.map( item => item.group_name);
    if (groupNameMap.includes(this.group_name) && this.group_name !== this.oldGroupName) {
      this.message.error('操作失败, 商品组名称已存在');
      return false;
    }


    if (groupNameMap.includes(this.group_name) && this.group_name === this.oldGroupName) {
      const body = {
        "publisher_id": 1,
        "channel_id": 2,
        "group_name": this.group_name,
        "group_filter": [...groupFilter],
        "catalogue_id": this.data.catalog_id,
        "old_group_name": this.oldGroupName,
        cid: this.cid,
      };
      this.launchService
        .updateGoodsGroup(body)
        .subscribe(
          (results: any) => {
            if (results.status_code && results.status_code !== 200 && results.status_code !== 205) {
              this.message.error(results.message);
            } else {
              this.getDataByCatalogue(true);
              this.message.success('操作成功');
            }
          },
          (err: any) => {
            this.message.error('数据获取异常，请重试');
          },
          () => {},
        );

    } else {
      const body = {
        "publisher_id": 1,
        "channel_id": 2,
        "group_name": this.group_name,
        "group_filter": [...groupFilter],
        "catalogue_id": this.data.catalog_id,
        cid: this.cid,
      };

      this.launchService
        .addGoodsGroup(body)
        .subscribe(
          (results: any) => {
            if (results.status_code && results.status_code !== 200 && results.status_code !== 205) {
              this.message.error(results.message);
            } else {
              this.getDataByCatalogue(true);
              if (results['data'].length) {
                this.data.group_id = results['data'][0]['group_id'];
              }
              this.is_save_group = false;
              this.message.success('操作成功');
            }
          },
          (err: any) => {
            this.message.error('数据获取异常，请重试');
          },
          () => {},
        );
    }

  }

  // 优化目标 - change
  bidTypeChange(event) {
    if (event === 1) {
      this.data.pay_mode = 0;
    } else {
      this.data.pay_mode = 1;
    }

    this.targetGroupChange();
  }

  targetGroupChange() {

    // this.changeValue.emit();
  }

}
