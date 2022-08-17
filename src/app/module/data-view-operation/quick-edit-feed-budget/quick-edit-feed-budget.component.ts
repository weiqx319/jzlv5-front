import { Component, DoCheck, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { differenceInCalendarDays, format } from "date-fns";

@Component({
  selector: 'app-quick-edit-feed-budget',
  templateUrl: './quick-edit-feed-budget.component.html',
  styleUrls: ['./quick-edit-feed-budget.component.scss'],
})
export class QuickEditFeedBudgetComponent implements OnInit, DoCheck, OnChanges {
  @Input() checkErrorTip;
  @Input() summaryType: any;
  @Input() publisherId: any = 1;
  @Input() matchTypeData: any;
  @Input() set parentData(data) {
    this.match_type = data;
  }
  @Input() checkCommit = false;
  @Output() submit = new EventEmitter<any>();
  public match_type = false;
  public xhsBudgetParams = {
    budget_type: 1,
    budget: 50,
    budget_type_sub: [
      { label: '不限', value: 1, },
      { label: '自定义', value: 2, },
    ],
    smart_switch: true,
  }


  public editBudgetParam = {
    budget: null,
    publisherId: null,
    iswraing: false,
    budgetRadio: 1,
    cron_setting_type: "now",
    cron_setting_time: new Date(),
    action: 1,
    price: null,
    cron_setting: "now",
    budgetRanges: {
      account: {
        1: { min: 50, max: '9999999.99', extraInfo: '范围:50-9999999.99' },
        6: { min: 50, max: '40000000', extraInfo: '范围:50-40000000' },
        7: { min: 1000, max: '9999999.99', extraInfo: '范围:1000-9999999.99' },
        17: { min: 100, max: '999999.99', extraInfo: '范围:100-999999.99' },
        24: { min: 50, extraInfo: '范围:大于50' },
      },
      campaign: {
        1: { min: 50, max: '9999999.99', extraInfo: '范围:50-9999999.99' },
        6: { min: 50, max: '4000000', extraInfo: '范围:50-4000000' },
        7: { min: 1000, max: '9999999.99', extraInfo: '范围:1000-9999999.99' },
        17: { min: 100, max: '999999.99', extraInfo: '范围:100-999999.99' },
        24: { min: 50, max: '999999.99', extraInfo: '范围:大于50' },
      },
      adgroup: {
        1: { min: 50, max: '9999999.99', extraInfo: '范围:50-9999999.99' },
        6: { min: 50, max: '4000000', extraInfo: '范围:50-4000000' },
        7: { min: 100, max: '9999999.99', extraInfo: '范围:100-9999999.99' },
        17: { min: 100, max: '999999.99', extraInfo: '范围:100-999999.99' },
        24: { min: 50, max: '999999.99', extraInfo: '范围:大于50' },
      },
    },
  };

  public priceArray = [
    { name: '提高', value: 1 },
    { name: '降低', value: 2 }
  ];

  constructor() { }

  ngOnInit() {
    this.editBudgetParam.publisherId = this.publisherId;
    this.emitData();
    this.emitBudgetData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.publisherId === 24) return;
    if (changes['checkCommit'] && changes['checkCommit']['previousValue'] !== undefined) {
      setTimeout(() => {
        this.budgetCheckPage();
        if (!this.editBudgetParam.iswraing) {
          let result = {};
          if (this.editBudgetParam.budgetRadio === 1) {
            result = { value: this.editBudgetParam.budget, cron_setting: this.editBudgetParam.cron_setting };
          }
          if (this.editBudgetParam.budgetRadio === 3) {
            result = { action: this.editBudgetParam.action, value: this.editBudgetParam.price, cron_setting: this.editBudgetParam.cron_setting };
          }
          if (this.editBudgetParam.budgetRadio === 2) {
            result = { value: null, cron_setting: this.editBudgetParam.cron_setting };
          }
          this.submit.emit({ result: result, type: 'budget' });
        }
      });

    }
  }
  emitBudgetData() {
    let result = {};
    if (this.editBudgetParam.budgetRadio === 1) {
      result = { value: this.editBudgetParam.budget, cron_setting: this.editBudgetParam.cron_setting };
    }
    if (this.editBudgetParam.budgetRadio === 3) {
      result = { action: this.editBudgetParam.action, value: this.editBudgetParam.price, cron_setting: this.editBudgetParam.cron_setting };
    }
    if (this.editBudgetParam.budgetRadio === 2) {
      result = { value: null, cron_setting: this.editBudgetParam.cron_setting };
    }
    this.submit.emit({ result: result, type: 'budget' });
  }

  ngDoCheck() {

  }
  budgetCheckPage() {
    if (this.publisherId === 24) return;
    this.editBudgetParam.iswraing = false;
    if (this.editBudgetParam.budgetRadio === 1) {
      if (this.editBudgetParam.publisherId) {
        if (this.editBudgetParam.budgetRanges[this.summaryType][this.editBudgetParam.publisherId].hasOwnProperty('min')) {
          if (this.editBudgetParam.budget < this.editBudgetParam.budgetRanges[this.summaryType][this.editBudgetParam.publisherId]['min']) {
            this.editBudgetParam.iswraing = true;
            // return false;
          }
        }
        if (this.editBudgetParam.budgetRanges[this.summaryType][this.editBudgetParam.publisherId].hasOwnProperty('max')) {
          if (this.editBudgetParam.budget > this.editBudgetParam.budgetRanges[this.summaryType][this.editBudgetParam.publisherId]['max']) {
            this.editBudgetParam.iswraing = true;
            // return false;
          }
        }


      }
    }

    if (this.editBudgetParam.budgetRadio == 3) {
      if (!this.editBudgetParam.price) {
        this.editBudgetParam.iswraing = true;
        // return false;
      }
    }
  }

  cronSettingChange() {
    if (this.editBudgetParam.cron_setting_type === 'now') {
      this.editBudgetParam.cron_setting = 'now';
    } else {
      this.editBudgetParam.cron_setting = format(new Date(this.editBudgetParam.cron_setting_time), 'yyyy-MM-dd HH:mm');
    }
    this.emitBudgetData();
  }

  changeCronTime() {
    this.editBudgetParam.cron_setting = format(new Date(this.editBudgetParam.cron_setting_time), 'yyyy-MM-dd HH:mm');
    this.emitBudgetData();
  }

  budgetChange($event) {
    this.budgetCheckPage();
    this.emitBudgetData();
  }
  budgetRadioChange($event) {
    this.editBudgetParam.iswraing = false;
    this.emitBudgetData();
  }

  disabledDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, new Date()) < 0;
  }

  emitData() {
    if (!this.xhsBudgetParams.budget) {
      this.checkErrorTip.xhs_budget.is_show = true;
    } else {
      this.checkErrorTip.xhs_budget.is_show = false;
    }
    this.submit.emit({ result: { type: this.xhsBudgetParams.budget_type, smart_switch: this.xhsBudgetParams.smart_switch, value: this.xhsBudgetParams.budget }, type: 'budget' });
  }

}
