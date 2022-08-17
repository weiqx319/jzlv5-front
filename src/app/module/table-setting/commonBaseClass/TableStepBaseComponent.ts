import { ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, SimpleChanges, ViewChild, Directive } from '@angular/core';
import { isArray, isNull, isUndefined } from "@jzl/jzl-util";
import { generateFilterDesc } from '@jzl/jzl-util';
import { ItemOperationsService } from '../../../shared/service/item-operations.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from '../../../core/service/auth.service';
import { DateDefineService } from '../../../shared/service/date-define.service';
import { TableItemService } from '../service/table-item.service';
import { MenuService } from '../../../core/service/menu.service';
import {
  differenceInCalendarDays, endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears
} from "date-fns";
import { SetSummaryTimeComponent } from '../../set-summary-time/set-summary-time.component';
import { CustomDatasService } from "../../../shared/service/custom-datas.service";

@Directive()
export class TableStepBaseComponent {

  @Input() runType = 1;
  @Input()
  set tableSetting(value: any) {
    this.reportTableData = Object.assign({}, this.reportTableData, value); // -- deepClone

    //当为时间报告时（粒度回显，后台返回的粒度 都会加 '_hour'）
    if (this.reportTableData.report_type === 'hours_report' || this.reportTableData.report_type == 'region_report') {
      this.reportTableData.summary_type = this.reportTableData.summary_type.split('_')[0];
    }
    if (this.reportTableData['condition'].length) {
      this.reportTableData['condition'].forEach(item => {
        if (item['type'] === 'string' || item['type'] === 'multiValue') {
          if (isArray(item['value'])) {
            item['value'] = item['value'].join('\n');
          } else {
            item['value'] = item['value'];
          }
        }
      });
    }

    this.reportTableTimeSetting.other_compare_date_list = [];

    if (this.reportTableData.other_compare_date_list && isArray(this.reportTableData.other_compare_date_list) && this.reportTableData.other_compare_date_list.length > 0) {
      this.reportTableData.other_compare_date_list.forEach((item, index) => {
        const tmpOtherSetting: any = {};
        tmpOtherSetting.summary_date = item.summary_date.indexOf('custom') === 0 ? 'custom' : item.summary_date;
        tmpOtherSetting.summary_date_range = this.splitDate(item.summary_date);
        tmpOtherSetting.alias = item.alias;
        this.reportTableTimeSetting.other_compare_date_list.push(tmpOtherSetting);
      });

    }

    if (isArray(this.reportTableData['filter_optimization_ids']) && this.reportTableData['filter_optimization_ids'].length > 0) {
      this.filterOptimizationId = this.reportTableData['filter_optimization_ids'][0];
    }
    this.reportTableTimeSetting.time_grain = this.reportTableData.time_grain;
    this.reportTableTimeSetting.summary_date = this.reportTableData.summary_date.indexOf('custom') === 0 ? 'custom' : this.reportTableData.summary_date;
    this.reportTableTimeSetting.summary_date_range = this.splitDate(this.reportTableData.summary_date);
    this.reportTableTimeSetting.summary_date_compare = this.reportTableData.summary_date_compare.indexOf('custom') === 0 ? 'custom_init' : this.reportTableData.summary_date_compare;
    this.reportTableTimeSetting.summary_date_compare_range = this.splitDate(this.reportTableData.summary_date_compare);
    this.reportTableTimeSetting.summary_date_alias = this.reportTableData.summary_date_alias;
    this.reportTableTimeSetting.summary_date_compare_alias = this.reportTableData.summary_date_compare_alias;

  }

  public currentStep = 0;
  public form: FormGroup;

  public dataItemAttrs = [];
  public summaryTypes = [];

  // public selectedItems = [];
  public selectItemIndex = 0;
  public clickSummaryTypeCount = 0; //记录第几次change粒度
  public reportTableData = {
    report_type: 'basic_report',
    summary_type: 'campaign',
    selected_items: [],
    locked_items: [],
    condition: [],
    data_range: [],
    is_compare: false,
    summary_date: 'day:1:0',
    summary_date_compare: 'day:2:0',
    summary_date_alias: '',
    summary_date_compare_alias: '',
    time_grain: 'summary',
    main_range: 'leftJoin',
    main_device: 'all',
    split_device: false,
    region_type: 'city_region',
    filter_optimization_ids: [],
    hidden_condition: false,
    arrangement_style: 'horizontal', //vertical:竖表  horizontal：横表
    other_compare_date_list: [],

  };
  public reportTableTimeSetting = {
    summary_date: 'day:1:0',
    summary_date_compare: 'day:2:0',
    summary_date_alias: '',
    summary_date_compare_alias: '',
    time_grain: 'summary',
    summary_date_range: [new Date(), new Date()],
    summary_date_compare_range: [new Date(), new Date()],
    other_compare_date_list: [],
  };

  public dateLists = [];
  public compareDateLists = [];
  public allConditionList = [];
  public conditionOper: any;

  public optimizationList = [];
  public optimizationLoading = false;
  public filterOptimizationId = null;
  public filterOptimizationIdRefreshFlag = false;

  public filterOption: any;

  public summary_time_attr = [];
  public reportTypeList = [
    { name: '基础报告', value: 'basic_report' },
    { name: '地域报告', value: 'region_report' },
    { name: '时段报告', value: 'hours_report' },
    { name: '维度报告', value: 'dim_report' },
  ];
  public userSelectedOper: { select_uid: number, select_cid: number, role_id: number } = { select_uid: 0, select_cid: 0, role_id: 0 };
  public lock_index_left = [];
  public lock_index_right = [];
  constructor(public subject: NzModalRef,
    public authService: AuthService,
    public modalService: NzModalService,
    public fb: FormBuilder,
    public dateDefineService: DateDefineService,
    public tableItemService,
    public itemOperationsService: ItemOperationsService,
    public _message: NzMessageService,
    public menuService: MenuService,
    public customDatasService: CustomDatasService,
  ) {
    this.conditionOper = this.itemOperationsService.getOperations();

    this.userSelectedOper = this.authService.getCurrentUserOperdInfo();
  }

  init() {


    if (this.runType == 2) {
      this.reportTypeList = [{ name: '纯报告', value: 'data_report' }];
      this.reportTableData.report_type = 'data_report';
    } else {
      if (this.userSelectedOper.role_id === 1 || this.userSelectedOper.role_id === 3 || this.userSelectedOper.role_id === 5 || this.userSelectedOper.role_id === 6) {
        this.reportTypeList.push({ name: '负责人报告', value: 'responsible_account' });
      }
      this.getIsLandingPage();
      this.getNameList();
    }
    // // -- 获取筛选条件列表
    // this.reportTableData['condition'] = '';

    this.refreshSummaryType(this.reportTableData['report_type']);
    this.changeSelectedDate(this.reportTableTimeSetting.summary_date);
    this.dateLists = this.dateDefineService.getDateList(this.reportTableData['summary_type'], this.menuService.currentChannelId, this.menuService.currentChannelId);
    const initData = this.tableItemService.getTableItems(this.reportTableData['report_type'], this.reportTableData['summary_type'], this.reportTableData['selected_items']);
    this.dataItemAttrs = initData['attrs'];
    this.reportTableData['selected_items'] = initData['selected'];



  }

  getIsLandingPage() {
    this.authService.getIsLandingPage().subscribe(result => {
      if (result.status_code === 200) {
        if (result['data'] && result['data']['valid']) {
          this.reportTypeList.push({ name: '着陆页报告', value: 'landing_page_account' });
        }
      } else {
        //不做任何处理
      }
    });
  }
  getNameList() {
    this.authService.getBizUnitList().subscribe(result => {
      if (result.status_code === 200) {
        const reportName = this.customDatasService.brandMapObjKey['trade_id_' + this.authService.advertiserType];
        if (reportName) {
          this.reportTypeList.push(
            { name: reportName + '效果报告', value: 'biz_unit_report' },
            { name: reportName + '小时报告', value: 'biz_unit_hours_report' },
            { name: reportName + '地域报告', value: 'biz_unit_region_report' },
          );

          if (this.authService.getCurrentUser().company_id === 4135) {
            this.reportTypeList.push(
              { name: reportName + '计划效果报告', value: 'biz_unit_campaign_report' },
              { name: reportName + '单元效果报告', value: 'biz_unit_adgroup_report' },
              { name: reportName + '关键词效果报告', value: 'biz_unit_keyword_report' },
            );
          }

        }

      } else {
        //不做任何处理
      }
    });
  }

  getDisableDate(current: Date) {
    return differenceInCalendarDays(current, new Date()) >= 0;
  }

  /**
   * 变更报告类型时触发,并且初始化数据
   * @param type
   */
  refreshSummaryType(type): void {
    this.summaryTypes = this.tableItemService.getSummaryTypes(type);
    const availableSummaryType = this.summaryTypes.find(item => item.key === this.reportTableData['summary_type']);
    if (!availableSummaryType && this.summaryTypes.length > 0) {
      this.reportTableData['summary_type'] = this.summaryTypes[0]['key'];
      this.summaryTypeChange(this.reportTableData['summary_type']);
    } else if (this.summaryTypes.length < 1 && type === 'dim_report') {
      this._message.error('无可用维度,请先创建维度');
    } else {
      this.summaryTypeChange(this.reportTableData['summary_type']);
    }
    if (this.summaryTypes.length > this.selectItemIndex + 1) {
      this.selectItemIndex = 0;
    }
  }

  summaryTypeChange(type): void {
    this.reportTableData['locked_items'] = this.tableItemService.getLockedItemsBySummaryType(type, this.reportTableData.report_type);
    if (this.filterOptimizationIdRefreshFlag && this.filterOptimizationId !== null) {
      this.filterOptimizationId = null;
    }

    if (type === 'optimization_detail_ranking') {
      this.filterOptimizationIdRefreshFlag = true;
      this.refreshOptimizationList(1);
    } else if (type === 'optimization_detail_effect') {
      this.filterOptimizationIdRefreshFlag = true;
      this.refreshOptimizationList(2);
    }
    this.clickSummaryTypeCount++;
    if (this.clickSummaryTypeCount > 1) {
      this.reportTableData.data_range = [];
    }

    this.dateLists = this.dateDefineService.getDateList(this.reportTableData['summary_type'], this.menuService.currentChannelId, this.menuService.currentChannelId);

  }

  /**
   * STEP2: 变更数据分类type 索引
   * @param index
   */
  changeSelectIndex(index): void {
    this.selectItemIndex = index;
  }

  /**
   * STEP2: 单个数据项的选中与取消操作
   * @param item
   * @param index
   * @param type
   */
  changeSelectedItem(item, index, type): void {
    if (item.data_type === 'pub_lock_data') {

      let lockItemSelectedIndex = 0;
      this.reportTableData.locked_items.forEach((lock, lockIndex) => {
        if (lock['key'] === item.key) {
          lockItemSelectedIndex = lockIndex;
        }
      });

      if (item.selected[type]) {
        this.dataItemAttrs[this.selectItemIndex]['selectIndexNum'][type]++;
        if (this.dataItemAttrs[this.selectItemIndex]['selectIndexNum'][type] === this.dataItemAttrs[this.selectItemIndex]['allIndexNum'][type]) {
          this.dataItemAttrs[this.selectItemIndex]['allSelected'][type] = true;
        }
        if (item['has_least'] && item['has_least'].indexOf(this.reportTableData.summary_type) !== -1) {
          this.dataItemAttrs[this.selectItemIndex]['leastSelectCount']++;
        }
        if (lockItemSelectedIndex === 0) {
          if (this.lock_index_left.length) { //有固定列
            if (index > this.lock_index_left[0]) {
              this.reportTableData.locked_items.push(item);
            }
            if (index < this.lock_index_left[0]) {

              this.reportTableData.locked_items.splice(this.lock_index_right[0], 0, item);
              this.getLockIndex();
            }
          } else { //无固定列
            this.reportTableData.locked_items.push(item);
          }
        }
      } else {
        if (item['has_least'] && item['has_least'].indexOf(this.reportTableData.summary_type) !== -1) {
          if (this.dataItemAttrs[this.selectItemIndex]['leastSelectCount'] !== 1) {
            this.dataItemAttrs[this.selectItemIndex]['leastSelectCount']--;
            this.dataItemAttrs[this.selectItemIndex]['selectIndexNum'][type]--;
            this.dataItemAttrs[this.selectItemIndex]['allSelected'][type] = false;
            this.reportTableData.locked_items.splice(lockItemSelectedIndex, 1);
          }
        } else {
          this.dataItemAttrs[this.selectItemIndex]['selectIndexNum'][type]--;
          this.dataItemAttrs[this.selectItemIndex]['allSelected'][type] = false;
          this.reportTableData.locked_items.splice(lockItemSelectedIndex, 1);

        }
        this.getLockIndex();
      }
    } else {
      const itemSelectedIndex = this.reportTableData.selected_items.indexOf(item);
      if (item.selected[type]) {
        this.dataItemAttrs[this.selectItemIndex]['selectIndexNum'][type]++;
        if (this.dataItemAttrs[this.selectItemIndex]['selectIndexNum'][type] === this.dataItemAttrs[this.selectItemIndex]['allIndexNum'][type]) {
          this.dataItemAttrs[this.selectItemIndex]['allSelected'][type] = true;
        }
        if (itemSelectedIndex < 0) {
          this.reportTableData.selected_items.push(item);
        }
      } else {
        this.dataItemAttrs[this.selectItemIndex]['selectIndexNum'][type]--;
        this.dataItemAttrs[this.selectItemIndex]['allSelected'][type] = false;
        if (itemSelectedIndex > -1) {
          const selectedKeys = Object.keys(item['selected']);
          let delFlag = true;
          selectedKeys.forEach((key) => {
            if (item['selected'][key]) {
              delFlag = false;
            }
          });
          if (delFlag) {
            this.reportTableData.selected_items.splice(itemSelectedIndex, 1);
          }
        }
      }
    }

  }

  /**
   *
   * STEP2: 某分类下数据项的全部选中与全部取消操作
   * @param type
   */
  changeSelectedItems(type): void {
    if (this.dataItemAttrs[this.selectItemIndex]['allSelected'][type]) {
      for (const key in this.dataItemAttrs[this.selectItemIndex]['data']) {
        if (!this.dataItemAttrs[this.selectItemIndex]['data'][key]['selected'][type] && (!this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'] || (this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'] && this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'].indexOf(this.reportTableData.summary_type) === -1))) {
          this.dataItemAttrs[this.selectItemIndex]['data'][key]['selected'][type] = true;
          this.changeSelectedItem(this.dataItemAttrs[this.selectItemIndex]['data'][key], key, type);
        }
      }
    } else {
      for (const key in this.dataItemAttrs[this.selectItemIndex]['data']) {
        if (this.dataItemAttrs[this.selectItemIndex]['data'][key]['selected'][type] && (!this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'] || (this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'] && this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'].indexOf(this.reportTableData.summary_type) === -1))) {
          this.dataItemAttrs[this.selectItemIndex]['data'][key]['selected'][type] = false;
          this.changeSelectedItem(this.dataItemAttrs[this.selectItemIndex]['data'][key], key, type);
        }
      }
    }
  }

  /**
   * STEP2 删除所选中的数据项
   * @param item
   * @param index
   */
  deleteSelectedItems(item, index): void {
    const removeItem = this.reportTableData.selected_items[index];
    this.reportTableData.selected_items.splice(index, 1);
    const selectedKeys = Object.keys(removeItem['selected']);
    selectedKeys.forEach((key) => {
      if (removeItem['selected'][key]) {
        removeItem['selected'][key] = false;
        this.changeSelectedItem(removeItem, 0, key);
      }
    });
  }

  /**
   * SETP3 时间选择操作
   * @param dateKey
   */
  changeSelectedDate(dateKey): void {
    if (this.reportTableTimeSetting.summary_date_compare === 'custom_init') {
      this.reportTableTimeSetting.summary_date_compare = 'custom';
    }
    this.compareDateLists = this.dateDefineService.getCompareDateList(dateKey);
    this.reportTableTimeSetting.summary_date_range = this.splitDate(dateKey, this.reportTableTimeSetting.summary_date_range);
    if (this.reportTableTimeSetting.summary_date_compare !== 'custom') {
      if (this.compareDateLists[1]) {
        this.reportTableTimeSetting.summary_date_compare = this.compareDateLists[1]['key']; // @todo 阿里组件bug
      } else {
        this.reportTableTimeSetting.summary_date_compare = 'custom'
      }
      this.reportTableTimeSetting.summary_date_compare_range = this.splitDate(this.reportTableTimeSetting.summary_date_compare, this.reportTableTimeSetting.summary_date_compare_range);
    }
  }

  changeOtherSelectedDate(dateKey, index): void {
    this.reportTableTimeSetting.other_compare_date_list[index]['summary_date_range'] = this.splitDate(dateKey, this.reportTableTimeSetting.other_compare_date_list[index]['summary_date_range']);
    if (this.reportTableTimeSetting.summary_date_compare === 'custom_init') {
      this.reportTableTimeSetting.other_compare_date_list[index]['summary_date'] = 'custom';
    }

  }

  removeOtherSelectedDate(index, e: MouseEvent) {
    e.preventDefault();
    if (this.reportTableTimeSetting.other_compare_date_list.length > 1) {
      this.reportTableTimeSetting.other_compare_date_list.splice(index, 1);
    } else {
      this.reportTableTimeSetting.other_compare_date_list = [];
    }
  }

  dataRangeChange(data) {
    this.reportTableData.data_range = data;
  }

  changeSelectedCompareDate(dateKey): void {
    // this.compareDateLists = this.dateDefineService.getCompareDateList(dateKey);
    // this.reportTableTimeSetting.summary_date_compare = this.compareDateLists[1]['key'];
  }
  addFilterField(e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    const control = {
      key: "",
      value: "",
      name: "",
      op: "",
      type: "",
      data_type: '',
    };
    if (this.allConditionList.length > 0) {
      const currentCondition = this.allConditionList[0];
      control.key = currentCondition.key;
      control.type = currentCondition.type;
      control.name = currentCondition.name;
      control.data_type = currentCondition.data_type;
      if (control.type === 'number') {
        control.op = '>';
        control.value = '';
      } else { //其他为字符串
        // control.type = 'string';
        control.op = '=';
        control.value = '';
      }

      this.reportTableData.condition.push(control);
    }
  }

  filterKeyChange(key, row) {
    const currentSelectCondition = this.allConditionList.find(item => item.key === key);
    if (!isUndefined(currentSelectCondition)) {
      row.type = currentSelectCondition.type;
      row.data_type = currentSelectCondition.data_type;
      row.name = currentSelectCondition.name;
      if (row.type === 'number') {
        row.op = '>';
        row.value = null;
      } else if (row.type === 'checkboxList') {
        row.op = 'in';
        row.value = null;
      } else {
        row.op = '=';
        row.value = null;
      }
    }
    if (row.type === 'singleList') {
      row['value'] = this.filterOption[row['key']]['filterOption'][0]['key'];
    }
  }

  removeFilterField(index, e: MouseEvent) {
    e.preventDefault();
    if (this.reportTableData.condition.length > 1) {
      this.reportTableData.condition.splice(index, 1);
    } else {
      this.reportTableData.condition = [];
    }
  }

  // -- 马上就下是按钮操作

  goNext(): any {
    if (this.currentStep === 0) { // -- 表明要进入选ITEM列表页
      if (this.reportTableData.summary_type === 'optimization_detail_ranking' || this.reportTableData.summary_type === 'optimization_detail_effect') {
        if (isNull(this.filterOptimizationId)) {
          this._message.error('请选择优化组');
          return;
        } else {
          const findOptimizationInfo = this.optimizationList.find((item) => {
            return item.optimization_id === this.filterOptimizationId;
          });
          if (isUndefined(findOptimizationInfo)) {
            this._message.error('优化组信息错误，请重新选择');
            return;
          } else {
            this.reportTableData.filter_optimization_ids = [this.filterOptimizationId];
          }
        }
      } else if (this.reportTableData.report_type === 'dim_report' && this.summaryTypes.length < 1) {
        this._message.error('无可用维度，请先创建维度');
        return;
      }
      const initData = this.tableItemService.getTableItems(this.reportTableData['report_type'], this.reportTableData['summary_type'], this.reportTableData['selected_items']);

      initData['attrs'].forEach((item, index) => {
        if (item['type'] === 'basic') {
          item['data'].forEach(option => {
            if (item['key'] === 'pub_lock_data') {
              item['selectIndexNum']['current'] = 0;
              item['lockSelectCount'] = 0;
              item['leastSelectCount'] = 0;
              this.reportTableData.locked_items.forEach(itemLock => {
                const is_same = item['data'].find(dataItem => itemLock['key'] === dataItem['key']);
                if (!isUndefined(is_same)) {
                  if (is_same.locking && is_same.locking.indexOf(this.reportTableData.report_type) !== -1) {
                    item['lockSelectCount']++;
                  }
                  if (is_same['has_least'] && is_same['has_least'].indexOf(this.reportTableData.summary_type) !== -1) {
                    item['leastSelectCount']++;
                  }

                  is_same['selected']['current'] = true;
                  item['selectIndexNum']['current']++;
                  if (item['selectIndexNum']['current'] === item['data'].length) {
                    item['allSelected']['current'] = true;
                  }
                }
              });

            } else {
              if (option['locking'] && option['locking'].indexOf(this.reportTableData['summary_type']) !== -1) {
                if (!option.selected.current) {
                  option.selected.current = true;
                  item.selectIndexNum.current++;
                  initData['selected'].push(option);

                }

              }
            }

          });
        }
      });
      this.dataItemAttrs = initData['attrs'];
      if (this.dataItemAttrs.length < this.selectItemIndex) {
        this.selectItemIndex = 0;
      }
      this.reportTableData['selected_items'] = initData['selected'];
      // this.allConditionList = this.tableItemService.getTableFilterItems(this.reportTableData['report_type'], this.reportTableData['summary_type']);
      // this.allConditionList = this.tableItemService.getAllTableFilterItems(this.reportTableData['report_type'], this.reportTableData['summary_type'], this.reportTableData.is_compare , false, this.reportTableData['selected_items']);
      // this.filterOption = this.tableItemService.getItemFilterType(this.reportTableData.summary_type);
      this.getLockIndex();
      ++this.currentStep;
    } else if (this.currentStep === 1) { // --表明要进入时间过滤页
      this.reportTableData.is_compare = false;
      this.reportTableData['selected_items'].every((item) => {
        if (item.selected && Object.keys(item.selected).length > 0) {
          for (const key of Object.keys(item.selected)) {
            if (item['selected'][key] && key !== 'current') {
              this.reportTableData.is_compare = true;
              break;
            }
          }
          return !this.reportTableData.is_compare;
        } else {
          return true;
        }
      });
      // --校验是否可进入下一步
      if (this.reportTableData['selected_items'].length < 1) {
        this._message.error('数据项不能为空，请选择');
      } else {
        ++this.currentStep;
        //地域报告
        if (this.reportTableData.report_type === 'biz_unit_region_report') {
          this.allConditionList = this.tableItemService.getAllTableFilterItems(this.reportTableData['report_type'], this.reportTableData['summary_type'], this.reportTableData.is_compare, false, this.reportTableData['selected_items'], this.reportTableData.locked_items);
        } else {
          this.allConditionList = this.tableItemService.getAllTableFilterItems(this.reportTableData['report_type'], this.reportTableData['summary_type'], this.reportTableData.is_compare, false, this.reportTableData['selected_items']);
        }
        this.filterOption = this.tableItemService.getItemFilterType(this.reportTableData.summary_type);

      }
    } else {
      ++this.currentStep;
    }
  }
  goPrev() {
    --this.currentStep;
  }

  done() {
    if (this.reportTableTimeSetting.summary_date.indexOf('custom') === 0) {
      this.reportTableData.summary_date = 'custom:' + format(this.reportTableTimeSetting.summary_date_range[0], 'yyyy-MM-dd') + ':' + format(this.reportTableTimeSetting.summary_date_range[1], 'yyyy-MM-dd');
    } else {
      this.reportTableData.summary_date = this.reportTableTimeSetting.summary_date;
    }
    if (this.reportTableTimeSetting.summary_date_compare.indexOf('custom') === 0) {
      this.reportTableData.summary_date_compare = 'custom:' + format(this.reportTableTimeSetting.summary_date_compare_range[0], 'yyyy-MM-dd') + ':' + format(this.reportTableTimeSetting.summary_date_compare_range[1], 'yyyy-MM-dd');
    } else {
      this.reportTableData.summary_date_compare = this.reportTableTimeSetting.summary_date_compare;
    }
    this.reportTableData.time_grain = this.reportTableTimeSetting.time_grain;

    const tmpOtherCompareDateList = [];
    this.reportTableTimeSetting.other_compare_date_list.forEach((item, index) => {
      const tmpOtherDate = {};
      if (item.summary_date.indexOf('custom') === 0) {
        tmpOtherDate["summary_date"] = 'custom:' + format(item.summary_date_range[0], 'yyyy-MM-dd') + ':' + format(item.summary_date_range[1], 'yyyy-MM-dd');
      } else {
        tmpOtherDate["summary_date"] = item.summary_date;
      }
      tmpOtherDate['alias'] = item.alias;
      tmpOtherCompareDateList.push(tmpOtherDate);
    });
    this.reportTableData.other_compare_date_list = tmpOtherCompareDateList;
    this.reportTableData.summary_date_alias = this.reportTableTimeSetting.summary_date_alias;
    this.reportTableData.summary_date_compare_alias = this.reportTableTimeSetting.summary_date_compare_alias;

    const new_condition = [];
    this.reportTableData.condition.forEach(item => {
      if (item['type'] === 'string' || item['type'] === 'multiValue') {
        if (item['value']) {
          const stringValue = [];
          item['value'].split('\n').forEach(valueItem => {
            if (valueItem !== '') {
              stringValue.push(this.trim(valueItem));
            }
          });
          item['value'] = stringValue;
          new_condition.push(item);
        }
      } else if (item['type'] === 'checkboxList') {
        if (item['value'] !== '') {
          new_condition.push(item);
        }
      } else {
        if (item['value'] !== '') {
          new_condition.push(item);
        }
      }
      /* if (item['type'] === 'number') {

         if (item['value'] !== '') {
           new_condition.push(item);
         }
       }
       if (item['type'] === 'checkboxList') {
         if (item['value'] !== '') {
           new_condition.push(item);
         }
       }*/
    });
    if (this.summary_time_attr.length) {
      this.reportTableData['hours_split'] = this.summary_time_attr;
    }
    //当为时间报告时（粒度后传，后台需要的的粒度 需要加 '_hour'）
    if (this.reportTableData.report_type === 'hours_report') {
      this.reportTableData.summary_type = this.reportTableData.summary_type + '_hour';
    } else if (this.reportTableData.report_type === 'region_report') {
      this.reportTableData.summary_type = this.reportTableData.summary_type + '_region';
    }
    this.reportTableData.condition = new_condition;
    const tableFinalObject = { ...this.reportTableData };
    this.subject.destroy({ dataType: 'table', data: tableFinalObject });

  }

  //去除字符串首位空格
  trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  }

  cancelModal(): void {
    this.subject.destroy('onCancel');
  }

  // 获取起止时间
  splitDate(timeStr: string, oldDataRang?: any): any {
    const timeArr = timeStr.split(':');
    const currentDate = new Date();
    const current_day = currentDate.getDay(); //获取今天是周几: 0(周日) ， 1(周一)， 2(周二) .. 依此类推；
    const current_date = currentDate.getDate();
    const current_month = currentDate.getMonth();

    if (timeArr[0] === 'day') {
      const largeDate = subDays(currentDate, +timeArr[1]);
      const minDate = subDays(largeDate, +timeArr[2]);
      return [minDate, largeDate];
    } else if (timeArr[0] === 'day_last_year') {
      const tmpDate = subDays(currentDate, +timeArr[1]);
      const largeDate = subYears(tmpDate, 1);
      const minDate = subYears(subDays(tmpDate, +timeArr[2]), 1);
      return [minDate, largeDate];

    } else if (timeArr[0] === 'week') {
      let startDate: any;
      let endDate: any;
      if (current_day === 1 && timeArr[1] === '0') { //如果选择本周并且当前（今天）的日期为本周的星期一
        startDate = startOfWeek(subWeeks(currentDate, +timeArr[1] + 1), { weekStartsOn: 1 });
        endDate = endOfWeek(subDays(startDate, +timeArr[2]), { weekStartsOn: 1 });
      } else {
        startDate = startOfWeek(subWeeks(currentDate, +timeArr[1]), { weekStartsOn: 1 });
        // timeArr[1] === '0'本周
        endDate = timeArr[1] === '0' ? subDays(currentDate, +1) : endOfWeek(subDays(startDate, +timeArr[2]), { weekStartsOn: 1 });
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'week_same_period') { //上周同期
      let startDate: any;
      let endDate: any;
      if (current_day === 1) { //如果当前（今天）的日期为本周的星期一，则'上周同期'取上一周的数据
        // 这是上上周的同期数据
        // startDate = startOfWeek(subWeeks(currentDate, +timeArr[1] + 1), { weekStartsOn: 1 });
        // endDate = endOfWeek(subDays(startDate, +timeArr[2]), { weekStartsOn: 1 });

        // 这是上周的数据
        startDate = startOfWeek(subWeeks(currentDate, +timeArr[1]), { weekStartsOn: 1 });
        endDate = endOfWeek(subDays(startDate, +timeArr[2]), { weekStartsOn: 1 });
      } else {
        startDate = startOfWeek(subWeeks(currentDate, +timeArr[1]), { weekStartsOn: 1 });
        endDate = subDays(currentDate, +8);
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'month') {
      let startDate: any;
      let endDate: any;
      if (current_date == 1 && timeArr[1] === '0') {//如果选择的是本月，并且今天是本月1号，则'本月'取上一月的数据
        startDate = startOfMonth(subMonths(currentDate, +timeArr[1] + 1));
        endDate = endOfMonth(subMonths(startDate, +timeArr[2]));
      } else {
        startDate = startOfMonth(subMonths(currentDate, +timeArr[1]));
        // timeArr[1] === '0'本月
        endDate = timeArr[1] === '0' ? subDays(currentDate, +1) : endOfMonth(subMonths(startDate, +timeArr[2]));
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'month_same_period') { //上月同期
      let startDate: any;
      let endDate: any;
      if (current_date == 1) {//如果是1号
        // 这是上上月的同期数据
        // startDate = startOfMonth(subMonths(currentDate, +timeArr[1] + 1));
        // endDate = subMonths(endOfMonth(subMonths(startDate, +timeArr[2] - 1)), +1);

        // 这是上月的数据
        startDate = startOfMonth(subMonths(currentDate, +timeArr[1]));
        endDate = endOfMonth(subMonths(startDate, +timeArr[2]));
      } else {
        startDate = startOfMonth(subMonths(currentDate, +timeArr[1]));
        endDate = subDays(subMonths(currentDate, 1), +1);
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'year') {
      let startDate: any;
      let endDate: any;
      if (current_month == 1 && current_date == 1 && timeArr[1] === '0') {//如果选择的是本年，并且今天是本年1月1号，则'本年'取上一年的数据
        startDate = startOfYear(subYears(currentDate, +timeArr[1] + 1));
        endDate = endOfYear(subYears(startDate, +timeArr[2]));
      } else {
        startDate = startOfYear(subYears(currentDate, +timeArr[1]));
        // timeArr[1] === '0'本年
        endDate = timeArr[1] === '0' ? subDays(currentDate, +1) : endOfYear(subYears(startDate, +timeArr[2]));
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'year_same_period') {//去年同期
      let startDate: any;
      let endDate: any;
      if (current_month == 1 && current_date == 1) {
        // 这是上上年的同期数据
        // startDate = startOfYear(subYears(currentDate, +timeArr[1] + 1));
        // endDate = endOfYear(subYears(startDate, +timeArr[2]));

        // 这是去年的数据
        startDate = startOfYear(subYears(currentDate, +timeArr[1]));
        endDate = endOfYear(subYears(startDate, +timeArr[2]));
      } else {
        startDate = startOfYear(subYears(currentDate, +timeArr[1]));
        endDate = subDays(subMonths(currentDate, 12), +1);
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'custom' && timeArr.length === 3) {
      const startDate = new Date(timeArr[1].replace(/-/g, "/"));
      const endDate = new Date(timeArr[2].replace(/-/g, "/"));
      return [startDate, endDate];
    } else {
      // == 组对时间
      return [...oldDataRang];
    }
  }

  refreshOptimizationList(type) {
    this.optimizationList = [];
    this.optimizationLoading = true;
    this.tableItemService.getOptimizationList({ result_model: 'all', optimization_type: type }).subscribe(result => {
      if (result.status_code == 200) {
        this.optimizationList = result['data'];
      }
    }, () => {
      this.optimizationLoading = false;
    }, () => {
      this.optimizationLoading = false;
    });

  }

  setSummaryTime() {
    const add_modal = this.modalService.create({
      nzTitle: '设置汇总时间',
      nzWidth: 600,
      nzContent: SetSummaryTimeComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        showParentSummaryTimeData: this.reportTableData['hours_split'],
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result.name && result.name === 'onOk') {
        this.summary_time_attr = result.value;
      }
    });
  }

  upLockSelectedItems(item, index): void {
    if (index !== 0) {
      const moveItem = this.reportTableData.locked_items[index];
      const moveItem_up = this.reportTableData.locked_items[index - 1];
      this.reportTableData.locked_items.splice(index, 1);
      this.reportTableData.locked_items.splice(index - 1, 1);
      this.reportTableData.locked_items.splice(index - 1, 0, moveItem);
      this.reportTableData.locked_items.splice(index, 0, moveItem_up);
    }

  }

  downLockSelectedItems(item, index): void {
    if (index !== (this.reportTableData.locked_items.length - 1)) {
      const moveItem = this.reportTableData.locked_items[index];
      const moveItem_down = this.reportTableData.locked_items[index + 1];
      this.reportTableData.locked_items.splice(index, 1);
      this.reportTableData.locked_items.splice(index, 1);
      this.reportTableData.locked_items.splice(index, 0, moveItem_down);
      this.reportTableData.locked_items.splice(index + 1, 0, moveItem);
    }

  }

  getLockIndex() {
    this.dataItemAttrs.forEach((item, index) => {
      if (item['key'] === 'pub_lock_data') {
        item['data'].forEach((opt, optIndex) => {
          if (opt['locking']) {
            this.lock_index_left = [];
            this.lock_index_left.push(optIndex);
            this.reportTableData.locked_items.forEach((lockItem, lockIndex) => {
              if (opt['key'] === lockItem['key']) {
                this.lock_index_right = [];
                this.lock_index_right.push(lockIndex);
              }
            });
          }
        });
      }

    });

  }

  addOtherCompareDate() {

    this.reportTableTimeSetting.other_compare_date_list.push({
      summary_date: 'day:1:0',
      summary_date_range: [subDays(new Date(), +1), subDays(new Date(), +1)],
      alias: '',
    },
    );
  }

}
