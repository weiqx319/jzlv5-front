import { isUndefined } from "@jzl/jzl-util";
import {pop} from "echarts/types/src/component/dataZoom/history";

export function copy() {

}


// 标题文案：数字、英文字母、英文标点符号都是半个字，奇数+1
export function getStringLengthBaidu(str, wordList) {

  let length = 0;

  const checkAry = [];
  const adWord = [];
  let word = '';
  let prevChar = '';
  if (str) {
    for (const char of str) {
      if ((char.charCodeAt(0) & 0xff00) != 0) {
        length++;
      }
      length++;


      if ((char === '{' && prevChar === '#' || char === '{' && prevChar === '$') && checkAry.length < 1) {
        checkAry.push(char);
        word = '';
      } else {
        if (checkAry.length === 1) {
          if (char == '}') {
            adWord.push(word);
            checkAry.pop();
          } else {
            word += char;
          }
        }
      }
      prevChar = char;
    }

    for (let i = 0; i < adWord.length; i++) {
      let adWordLength = 0;
      for (const subChar of adWord[i]) {
        if ((subChar.charCodeAt(0) & 0xff00) != 0) {
          adWordLength++;
        }
        adWordLength++;
      }

      length = length - adWordLength - 3 + 1;
    }
  }
  return length;
}




// 标题文案：数字、英文字母、英文标点符号都是半个字，奇数+1
export function getStringLength(str, wordList) {
  let strNum = str.match(/\d|[A-Za-z]|\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\-|\=|\[|\]|\{|\}|\\|\||\;|\'|\'|\:|\"|\"|\,|\.|\/|\<|\>|\?+/g);
  if (!strNum) {
    strNum = [];
  }
  let length = str.length - strNum.length + Math.ceil((strNum.length / 2));

  const checkAry = [];
  const adWord = [];
  let word = '';
  if (str) {
    for (const char of str) {
      if (char === '{') {
        checkAry.push(char);
        word = '';
      } else {
        if (checkAry.length === 1) {
          if (char == '}') {
            adWord.push(word);
            checkAry.pop();
          } else {
            word += char;
          }
        }
      }
    }

    for (let i = 0; i < adWord.length; i++) {
      if (wordList.includes(adWord[i])) {
        switch (adWord[i]) {
          case '地点': {
            length = length - (adWord[i].length + 1) + 4;
            break;
          }
          case '日期': {
            length = length - (adWord[i].length + 1) + 6;
            break;
          }
          case '星期': {
            length = length - (adWord[i].length + 1) + 3;
            break;
          }
          case '用餐类型': {
            length = length - (adWord[i].length + 1) + 2;
            break;
          }
          case '省份': {
            length = length - (adWord[i].length + 1) + 3;
            break;
          }
          case '月份': {
            length = length - (adWord[i].length + 1) + 3;
            break;
          }
          case '节日': {
            length = length - (adWord[i].length + 1) + 5;
            break;
          }
          case '网络环境': {
            length = length - (adWord[i].length + 1) + 4;
            break;
          }
          case '男人女人': {
            length = length - (adWord[i].length + 1) + 2;
            break;
          }
          case '帅哥美女': {
            length = length - (adWord[i].length + 1) + 2;
            break;
          }
          case '他她': {
            length = length - (adWord[i].length + 1) + 1;
            break;
          }
          case '反性别-夫妻': {
            length = length - (adWord[i].length + 1) + 2;
            break;
          }
          case '年龄': {
            length = length - (adWord[i].length + 1) + 3;
            break;
          }
          case '手机系统': {
            length = length - (adWord[i].length + 1) + 4;
            break;
          }
          case '运营商': {
            length = length - (adWord[i].length + 1) + 2;
            break;
          }
          case '区县': {
            length = length - (adWord[i].length + 1) + 6;
            break;
          }
          case '行业': {
            length = length - (adWord[i].length + 1) + 4;
            break;
          }
          case '家用电器': {
            length = length - (adWord[i].length + 1) + 4;
            break;
          }
          case '考试': {
            length = length - (adWord[i].length + 1) + 4;
            break;
          }
        }
      }
    }
  }
  return length;
}
// 标题文案：数字、英文字母、英文标点符号都是1个字，中文字符2个字
export function getStringLengthNew(str, wordList) {
  let strNum = str.match(/[^\x00-\xff]/g);
  if (!strNum) {
    strNum = [];
  }
  let length = str.length + strNum.length;

  const checkAry = [];
  const adWord = [];
  let word = '';
  if (str) {
    for (const char of str) {
      if (char === '{') {
        checkAry.push(char);
        word = '';
      } else {
        if (checkAry.length === 1) {
          if (char == '}') {
            adWord.push(word);
            checkAry.pop();
          } else {
            word += char;
          }
        }
      }
    }

    for (let i = 0; i < adWord.length; i++) {
      if (wordList.includes(adWord[i])) {
        switch (adWord[i]) {
          case '地点': {
            length = length - (adWord[i].length + 1) + 4;
            break;
          }
          case '日期': {
            length = length - (adWord[i].length + 1) + 6;
            break;
          }
          case '星期': {
            length = length - (adWord[i].length + 1) + 3;
            break;
          }
          case '用餐类型': {
            length = length - (adWord[i].length + 1) + 2;
            break;
          }
          case '省份': {
            length = length - (adWord[i].length + 1) + 3;
            break;
          }
          case '月份': {
            length = length - (adWord[i].length + 1) + 3;
            break;
          }
          case '节日': {
            length = length - (adWord[i].length + 1) + 5;
            break;
          }
          case '网络环境': {
            length = length - (adWord[i].length + 1) + 4;
            break;
          }
          case '男人女人': {
            length = length - (adWord[i].length + 1) + 2;
            break;
          }
          case '帅哥美女': {
            length = length - (adWord[i].length + 1) + 2;
            break;
          }
          case '他她': {
            length = length - (adWord[i].length + 1) + 1;
            break;
          }
          case '反性别-夫妻': {
            length = length - (adWord[i].length + 1) + 2;
            break;
          }
          case '年龄': {
            length = length - (adWord[i].length + 1) + 3;
            break;
          }
          case '手机系统': {
            length = length - (adWord[i].length + 1) + 4;
            break;
          }
          case '运营商': {
            length = length - (adWord[i].length + 1) + 2;
            break;
          }
          case '区县': {
            length = length - (adWord[i].length + 1) + 6;
            break;
          }
          case '行业': {
            length = length - (adWord[i].length + 1) + 4;
            break;
          }
          case '家用电器': {
            length = length - (adWord[i].length + 1) + 4;
            break;
          }
          case '考试': {
            length = length - (adWord[i].length + 1) + 4;
            break;
          }
        }
      }
    }
  }
  return length;
}



export function explainTableField(data, tmpField, self) {
  if (isUndefined(self.viewTableData['summary_date_alias'])) {
    self.viewTableData['summary_date_alias'] = '';
  }
  if (isUndefined(self.viewTableData['summary_date_compare_alias'])) {
    self.viewTableData['summary_date_compare_alias'] = '';
  }
  let hasCreative = false;
  data.forEach((item) => {
    let popKey = item.key;
    if (item.hasOwnProperty('showKey') && item.showKey !== '') {
      popKey = item.showKey;
    }
    const tplHeader = {};
    if (self.tableItemService.tipMap[popKey]) {
      tplHeader['remarks'] = self.tableItemService.tipMap[popKey];
    }
    if (self.allFilterOption.hasOwnProperty(popKey)) {
      tplHeader['headerTemplate'] = self.filterHeader;
      tplHeader['data'] = self.allFilterOption[popKey];
      tplHeader['headerTemplateType'] = 'filterHeader';
    }
    if (popKey === 'campaign_cnt') {
      tplHeader['cellTemplateType'] = 'campaignCnt';
      tplHeader['cellTemplate'] = self.campaignCntCell;
    }
    if(popKey === 'budget_offline_time_str') {
      tplHeader['cellTemplateType'] = 'budgetOffline';
      tplHeader['cellTemplate'] = self.budgetOfflineCell;
    }
    if (item['is_rate']) {
      tplHeader['cellTemplate'] = self.rateCell;
      tplHeader['cellTemplateType'] = 'rateCell';
    }
    if (item.hasOwnProperty('sortable')) {
      tplHeader['sortable'] = item.sortable;
    }

    if (item.type && item.type === 'number') {
      tplHeader['cellClass'] = 'num_right';
      tplHeader['headerClass'] = 'header_right';
    }

    if (popKey === 'wap_quality' || popKey === 'pc_quality') {
      tplHeader['cellTemplate'] = self.starTpl;
      tplHeader['cellTemplateType'] = 'starTpl';
    }
    if (popKey === 'schedule') {
      tplHeader['cellTemplate'] = self.scheduleCell;
      tplHeader['cellTemplateType'] = 'scheduleCell';
    }

    if (popKey === 'pub_creative_title') {
      hasCreative = true;
      tplHeader['cellTemplate'] = self.creativeCell;
      tplHeader['cellTemplateType'] = 'creativeCell';
    }

    if (popKey === 'pub_creative_title_temp') {
      hasCreative = true;
      tplHeader['cellTemplate'] = self.creativeCellTemp;
      tplHeader['cellTemplateType'] = 'creativeCellTemp';
    }

    //非总览视图和优化经理和经理视图
    if (self.userSelectedOper.role_id !== 5 && self.userSelectedOper.role_id !== 2 && self.userSelectedOper.role_id !== 6) {
      if (popKey === 'budget') {
        hasCreative = true;
        tplHeader['cellTemplate'] = self.budgetCell;
        tplHeader['cellTemplateType'] = 'budgetCell';
      }
      if ((self.viewTableData.summary_type === 'adgroup' || self.viewTableData.summary_type === 'campaign' || self.viewTableData.summary_type === 'keyword') && popKey === 'status') {
        tplHeader['cellTemplate'] = self.statusCell;
        tplHeader['cellTemplateType'] = 'statusCell';
      }
      if (self.viewTableData.summary_type === 'campaign' && popKey === 'pc_price_ratio') {
        tplHeader['cellTemplate'] = self.priceRatioPCCell;
        tplHeader['cellTemplateType'] = 'priceRatioPCCell';
      }
      if (self.viewTableData.summary_type === 'campaign' && popKey === 'wap_price_ratio') {
        tplHeader['cellTemplate'] = self.priceRatioWapCell;
        tplHeader['cellTemplateType'] = 'priceRatioWapCell';
      }

      if (popKey === 'pause_name') {
        tplHeader['cellTemplate'] = self.pauseCell;
        tplHeader['cellTemplateType'] = 'pauseCell';
      }
    }
    if (popKey === 'wap_destination_url') {
      hasCreative = true;
      tplHeader['cellTemplate'] = self.wapUrlCell;
      tplHeader['cellTemplateType'] = 'wapUrlCell';
    }
    if (popKey === 'pc_destination_url') {
      hasCreative = true;
      tplHeader['cellTemplate'] = self.pcUrlCell;
      tplHeader['cellTemplateType'] = 'pcUrlCell';
    }

    if (popKey === 'deeplink_url') {
      tplHeader['cellTemplate'] = self.deepLinkUrlCell;
      tplHeader['cellTemplateType'] = 'deepLinkUrlCell';
    }



    if (item.selected && item.selected['current']) {
      // {"prop": "pub_keyword_id", name: '关键词'},
      if (item.type && item.type === 'number') {
        tplHeader['summaryFunc'] = () => self.summaryData[popKey];
        tplHeader['summaryTemplate'] = self.summaryCell;
        tplHeader['summaryTemplateType'] = 'summaryCell';
        if (item['is_rate']) {
          tplHeader['summaryTemplate'] = self.rateSummaryCell;
          tplHeader['summaryTemplateType'] = 'rateSummaryCell';
        }
      }
      if (popKey === 'ranknow') {
        tplHeader['headerTemplate'] = self.refreshHeader;
        tplHeader['cellTemplate'] = self.refreshCell;
        tplHeader['headerTemplateType'] = 'refreshHeader';
        tplHeader['cellTemplateType'] = 'refreshCell';
      }
      if (self.userSelectedOper.role_id !== 5 && self.userSelectedOper.role_id !== 2 && self.userSelectedOper.role_id !== 6) {
        if (popKey === 'price') {
          tplHeader['cellTemplate'] = self.priceCell;
          tplHeader['cellTemplateType'] = 'priceCell';
        }
        if (popKey === 'max_price') {
          tplHeader['cellTemplate'] = self.priceCell;
          tplHeader['cellTemplateType'] = 'priceCell';
        }
        if (popKey === 'ocpc_bid' || popKey === 'ocpc_deep_cpa' || popKey === 'exp_amt') {
          tplHeader['cellTemplate'] = self.priceCell;
          tplHeader['cellTemplateType'] = 'priceCell';
        }
      }
      let showName = item.name;
      if (["pub_metric_data", "metric_data", "conversion_data"].indexOf(item.data_type) != -1) {
        showName = self.viewTableData['summary_date_alias'] + item.name;
      }

      tmpField.push({ prop: popKey, name: showName, resizeable: true, width: item.width, ...tplHeader });
    }
    if (item.selected && item.selected['compare']) {
      const showName = self.viewTableData['summary_date_compare_alias'] + item.name + '#';
      tplHeader['summaryFunc'] = () => self.summaryData[popKey + '_cmp'];
      tplHeader['summaryTemplate'] = self.summaryCell;
      tplHeader['summaryTemplateType'] = 'summaryCell';
      if (item['is_rate']) {
        tplHeader['summaryTemplate'] = self.rateSummaryCell;
        tplHeader['summaryTemplateType'] = 'rateSummaryCell';
      }
      if (self.allFilterOption.hasOwnProperty(popKey)) {
        if (self.allFilterOption.hasOwnProperty(popKey + '_cmp')) {
          tplHeader['data'] = self.allFilterOption[popKey + '_cmp'];
        } else {
          self.allFilterOption[popKey + '_cmp'] = {
            filterType: 'numberFilter',
            filterOption: [],
            filterKey: { key: popKey + '_cmp', data_type: item.data_type, name: showName, type: 'numberFilter' },
            filterResult: {},
          };
          tplHeader['data'] = self.allFilterOption[popKey + '_cmp'];
        }
      }
      tmpField.push({ prop: popKey + '_cmp', draggable: false, name: showName, resizeable: true, width: item.width, ...tplHeader });
      if (self.viewTableData.time_grain == 'summary') {
        self.viewTableData['other_compare_date_list'].forEach((otherItem, key) => {
          const currentOtherCompareField = popKey + '_cmp' + key;
          tplHeader['summaryFunc'] = () => self.summaryData[currentOtherCompareField];
          tplHeader['summaryTemplate'] = self.summaryCell;
          if (item['is_rate']) {
            tplHeader['summaryTemplate'] = self.rateSummaryCell;
            tplHeader['summaryTemplateType'] = 'rateSummaryCell';
          }

          if (self.allFilterOption.hasOwnProperty(popKey)) {
            if (self.allFilterOption.hasOwnProperty(currentOtherCompareField)) {
              tplHeader['data'] = self.allFilterOption[currentOtherCompareField];
            } else {
              self.allFilterOption[currentOtherCompareField] = {
                filterType: 'numberFilter',
                filterOption: [],
                filterKey: { key: currentOtherCompareField, data_type: item.data_type, name: otherItem.alias ? otherItem.alias + item.name + '#' : item.name + '#' + (key + 2), type: 'numberFilter' },
                filterResult: {},
              };
              tplHeader['data'] = self.allFilterOption[currentOtherCompareField];
            }
          }

          tmpField.push({ prop: currentOtherCompareField, draggable: false, name: otherItem.alias ? otherItem.alias + item.name + '#' : item.name + '#' + (key + 2), resizeable: true, width: item.width, ...tplHeader });

        });
      }

    }
    if (item.selected && item.selected['compare_abs']) {
      const showName = self.viewTableData['summary_date_compare_alias'] + item.name + '△';
      if (item['is_rate']) {
        tplHeader['cellTemplate'] = self.rateCellColor;
        tplHeader['summaryTemplate'] = self.rateSummaryCellColor;
        tplHeader['cellTemplateType'] = 'rateCellColor';
        tplHeader['summaryTemplateType'] = 'rateSummaryCellColor';
      } else {
        tplHeader['cellTemplate'] = self.cellColor;
        tplHeader['summaryTemplate'] = self.summaryCellColor;
        tplHeader['cellTemplateType'] = 'cellColor';
        tplHeader['summaryTemplateType'] = 'summaryCellColor';
      }
      tplHeader['summaryFunc'] = () => self.summaryData[popKey + '_abs'];

      if (self.allFilterOption.hasOwnProperty(popKey)) {
        if (self.allFilterOption.hasOwnProperty(popKey + '_abs')) {
          tplHeader['data'] = self.allFilterOption[popKey + '_abs'];
        } else {
          self.allFilterOption[popKey + '_abs'] = {
            filterType: 'numberFilter',
            filterOption: [],
            filterKey: { key: popKey + '_abs', data_type: item.data_type, name: showName, type: 'numberFilter' },
            filterResult: {},
          };
          tplHeader['data'] = self.allFilterOption[popKey + '_abs'];
        }
      }

      tmpField.push({ prop: popKey + '_abs', draggable: false, name: showName, resizeable: true, width: item.width, ...tplHeader });

      if (self.viewTableData.time_grain == 'summary') {
        self.viewTableData['other_compare_date_list'].forEach((otherItem, key) => {
          const currentOtherCompareField = popKey + '_abs' + key;
          tplHeader['summaryFunc'] = () => self.summaryData[currentOtherCompareField];
          tplHeader['summaryTemplate'] = self.summaryCellColor;
          tplHeader['cellTemplate'] = self.cellColor;
          tplHeader['summaryTemplateType'] = 'summaryCellColor';
          tplHeader['cellTemplateType'] = 'cellColor';
          if (item['is_rate']) {
            tplHeader['cellTemplate'] = self.rateCellColor;
            tplHeader['summaryTemplate'] = self.rateSummaryCellColor;
            tplHeader['summaryTemplateType'] = 'rateSummaryCellColor';
            tplHeader['cellTemplateType'] = 'rateCellColor';
          }

          if (self.allFilterOption.hasOwnProperty(popKey)) {
            if (self.allFilterOption.hasOwnProperty(currentOtherCompareField)) {
              tplHeader['data'] = self.allFilterOption[currentOtherCompareField];
            } else {
              self.allFilterOption[currentOtherCompareField] = {
                filterType: 'numberFilter',
                filterOption: [],
                filterKey: { key: currentOtherCompareField, data_type: item.data_type, name: otherItem.alias ? otherItem.alias + item.name + '△' : item.name + '△' + (key + 2), type: 'numberFilter' },
                filterResult: {},
              };
              tplHeader['data'] = self.allFilterOption[currentOtherCompareField];
            }
          }

          tmpField.push({ prop: currentOtherCompareField, draggable: false, name: otherItem.alias ? otherItem.alias + item.name + '△' : item.name + '△' + (key + 2), resizeable: true, width: item.width, ...tplHeader });

        });
      }

    }
    if (item.selected && item.selected['compare_rate']) {
      const showName = self.viewTableData['summary_date_compare_alias'] + item.name + '%';
      tplHeader['cellTemplate'] = self.rateCellColor;
      tplHeader['summaryFunc'] = () => self.summaryData[popKey + '_rat'];
      tplHeader['summaryTemplate'] = self.rateSummaryCellColor;
      tplHeader['summaryTemplateType'] = 'rateSummaryCellColor';
      tplHeader['cellTemplateType'] = 'rateCellColor';

      if (self.allFilterOption.hasOwnProperty(popKey)) {
        if (self.allFilterOption.hasOwnProperty(popKey + '_rat')) {
          tplHeader['data'] = self.allFilterOption[popKey + '_rat'];
        } else {
          self.allFilterOption[popKey + '_rat'] = {
            filterType: 'numberFilter',
            filterOption: [],
            filterKey: { key: popKey + '_rat', data_type: item.data_type, name: showName, type: 'numberFilter' },
            filterResult: {},
          };
          tplHeader['data'] = self.allFilterOption[popKey + '_rat'];
        }
      }
      tmpField.push({ prop: popKey + '_rat', draggable: false, name: showName, resizeable: true, width: item.width, cellTemplate: self.rateCell, ...tplHeader });

      if (self.viewTableData.time_grain == 'summary') {
        self.viewTableData['other_compare_date_list'].forEach((otherItem, key) => {
          const currentOtherCompareField = popKey + '_rat' + key;
          tplHeader['summaryFunc'] = () => self.summaryData[currentOtherCompareField];
          tplHeader['summaryTemplate'] = self.rateSummaryCellColor;
          tplHeader['cellTemplate'] = self.rateCellColor;
          tplHeader['summaryTemplateType'] = 'rateSummaryCellColor';
          tplHeader['cellTemplateType'] = 'rateCellColor';

          if (self.allFilterOption.hasOwnProperty(popKey)) {
            if (self.allFilterOption.hasOwnProperty(currentOtherCompareField)) {
              tplHeader['data'] = self.allFilterOption[currentOtherCompareField];
            } else {
              self.allFilterOption[currentOtherCompareField] = {
                filterType: 'numberFilter',
                filterOption: [],
                filterKey: { key: currentOtherCompareField, data_type: item.data_type, name: item.name + '%', type: 'numberFilter' },
                filterResult: {},
              };
              tplHeader['data'] = self.allFilterOption[currentOtherCompareField];
            }
          }

          tmpField.push({ prop: currentOtherCompareField, draggable: false, name: otherItem.alias ? otherItem.alias + item.name + '%' : item.name + '%' + (key + 2), resizeable: true, width: item.width, ...tplHeader });

        });
      }
    }

    if (item.selected && item.selected['avg'] && !item['is_rate']) {
      let showName = item.name;
      if (["pub_metric_data", "metric_data", "conversion_data"].indexOf(item.data_type) != -1) {
        showName = self.viewTableData['summary_date_alias'] + item.name + '日均';
      }
      delete tplHeader['cellTemplate'];
      delete tplHeader['cellTemplateType'];

      if (item.type && item.type === 'number') {
        tplHeader['summaryFunc'] = () => self.summaryData[popKey + '_avg'];
        tplHeader['summaryTemplate'] = self.summaryCell;
        tplHeader['summaryTemplateType'] = 'summaryCell';
        if (item['is_rate']) {
          tplHeader['summaryTemplate'] = self.rateSummaryCell;
          tplHeader['cellTemplate'] = this.rateCellColor;
          tplHeader['summaryTemplateType'] = 'rateSummaryCell';
          tplHeader['cellTemplateType'] = 'rateCellColor';
        }
      }

      delete tplHeader['headerTemplate'];
      delete tplHeader['headerTemplateType'];
      tmpField.push({ prop: popKey + '_avg', draggable: false, sortable: false, name: showName, resizeable: true, width: item.width, ...tplHeader });

    }
    if (item.selected && item.selected['percentage'] && !item['is_rate']) {
      tplHeader['cellTemplate'] = self.progressCell;
      tplHeader['cellTemplateType'] = 'progressCell';
      let showName = item.name;
      if (["pub_metric_data", "metric_data", "conversion_data"].indexOf(item.data_type) != -1) {
        showName = self.viewTableData['summary_date_alias'] + item.name + '占比';
      }
      if (item.type && item.type === 'number') {
        tplHeader['summaryFunc'] = () => self.summaryData[popKey + '_per'];
        tplHeader['summaryTemplate'] = self.summaryCell;
        tplHeader['summaryTemplateType'] = 'summaryCell';
        if (item['is_rate']) {
          tplHeader['summaryTemplate'] = self.rateSummaryCell;
          tplHeader['summaryTemplateType'] = 'rateSummaryCell';
        }
      }

      delete tplHeader['headerTemplate'];
      delete tplHeader['headerTemplateType'];
      tmpField.push({ prop: popKey + '_per', originProp: popKey, draggable: false, sortable: false, name: showName, resizeable: true, width: 160, ...tplHeader });

    }
  });

  return hasCreative;
}



export function explainTableFeedField(data, tmpField, self) {
  if (isUndefined(self.viewTableData['summary_date_alias'])) {
    self.viewTableData['summary_date_alias'] = '';
  }
  if (isUndefined(self.viewTableData['summary_date_compare_alias'])) {
    self.viewTableData['summary_date_compare_alias'] = '';
  }
  const hasCreative = false;
  data.forEach((item) => {
    let popKey = item.key;
    if (item.hasOwnProperty('showKey') && item.showKey !== '') {
      popKey = item.showKey;
    }
    const tplHeader = {};

    if (self.tableItemService.tipMap[popKey]) {
      tplHeader['remarks'] = self.tableItemService.tipMap[popKey];
    }
    if (self.allFilterOption.hasOwnProperty(popKey)) {
      tplHeader['headerTemplate'] = self.filterHeader;
      tplHeader['data'] = self.allFilterOption[popKey];
      tplHeader['headerTemplateType'] = 'filterHeader';
    }

    if (item['is_rate']) {
      tplHeader['cellTemplate'] = self.rateCell;
      tplHeader['cellTemplateType'] = 'rateCell';
    }
    if (item.hasOwnProperty('sortable')) {
      tplHeader['sortable'] = item.sortable;
    }

    if (item.type && item.type === 'number') {
      tplHeader['cellClass'] = 'num_right';
      tplHeader['headerClass'] = 'header_right';
    }
    if (popKey === 'schedule' || popKey === 'schedule_time') {
      tplHeader['cellTemplate'] = self.scheduleCell;
      tplHeader['cellTemplateType'] = 'scheduleCell';
    }
    if (popKey === 'creative') {
      tplHeader['cellTemplate'] = self.creativeCell;
      tplHeader['cellTemplateType'] = 'creativeCell';
    }
    if (popKey === 'ranknow') {
      tplHeader['headerTemplate'] = self.refreshHeader;
      tplHeader['cellTemplate'] = self.refreshCell;
      tplHeader['headerTemplateType'] = 'refreshHeader';
      tplHeader['cellTemplateType'] = 'refreshCell';
    }

    if (self.userSelectedOper.role_id !== 5 && self.userSelectedOper.role_id !== 2 && self.userSelectedOper.role_id !== 6) {
      if (popKey === 'budget') {
        tplHeader['cellTemplate'] = self.budgetCell;
        tplHeader['cellTemplateType'] = 'budgetCell';
      }

      if ((self.viewTableData.summary_type === 'adgroup' || self.viewTableData.summary_type === 'campaign' || self.viewTableData.summary_type === 'keyword' || self.viewTableData.summary_type === 'creative') && popKey === 'status') {
        if (self.publisher_id == 1) {
          tplHeader['cellTemplate'] = self.statusCell;
          tplHeader['cellTemplateType'] = 'statusCell';
        }
        if (self.publisher_id == 7 && self.viewTableData.summary_type === 'campaign') {
          tplHeader['cellTemplate'] = self.statusCell;
          tplHeader['cellTemplateType'] = 'statusCell';
        }

      }

      if (popKey == 'pause') {
        tplHeader['cellTemplate'] = self.pauseCell;
        tplHeader['cellTemplateType'] = 'pauseCell';
      }
      if (popKey == 'opt_status') {
        tplHeader['cellTemplate'] = self.pauseCell;
        tplHeader['cellTemplateType'] = 'pauseCell';
      }

      if ((popKey === 'price' || popKey === 'bid' || popKey === 'bid_amount') && self.publisher_id !== 9) {
        tplHeader['cellTemplate'] = self.priceCell;
        tplHeader['cellTemplateType'] = 'priceCell';
      }

      if (popKey === 'ocpc_bid') {
        tplHeader['cellTemplate'] = self.ocpcBidCell;
        tplHeader['cellTemplateType'] = 'ocpcBidCell';
      }

    }


    if (item.selected && item.selected['current']) {
      // {"prop": "pub_keyword_id", name: '关键词'},
      if (item.type && item.type === 'number') {
        tplHeader['summaryFunc'] = () => self.summaryData[popKey];
        tplHeader['summaryTemplate'] = self.summaryCell;
        tplHeader['summaryTemplateType'] = 'summaryCell';
        if (item['is_rate']) {
          tplHeader['summaryTemplate'] = self.rateSummaryCell;
          tplHeader['summaryTemplateType'] = 'rateSummaryCell';
        }
      }


      let showName = item.name;
      if (["pub_attr_data", "pub_lock_data"].indexOf(item.data_type) == -1) {
        showName = self.viewTableData['summary_date_alias'] + item.name;
      }

      tmpField.push({
        prop: popKey,
        name: showName,
        resizeable: true,
        width: item.width,
        ...tplHeader,
      });
    }
    if (item.selected && item.selected['compare']) {
      const showName = self.viewTableData['summary_date_compare_alias'] + item.name + '#';
      tplHeader['summaryFunc'] = () => self.summaryData[popKey + '_cmp'];
      tplHeader['summaryTemplate'] = self.summaryCell;
      tplHeader['summaryTemplateType'] = 'summaryCell';
      if (item['is_rate']) {
        tplHeader['summaryTemplate'] = self.rateSummaryCell;
        tplHeader['summaryTemplateType'] = 'rateSummaryCell';
      }
      if (self.allFilterOption.hasOwnProperty(popKey)) {
        if (self.allFilterOption.hasOwnProperty(popKey + '_cmp')) {
          tplHeader['data'] = self.allFilterOption[popKey + '_cmp'];
        } else {
          self.allFilterOption[popKey + '_cmp'] = {
            filterType: 'numberFilter',
            filterOption: [],
            filterKey: { key: popKey + '_cmp', data_type: item.data_type, name: showName, type: 'numberFilter' },
            filterResult: {},
          };
          tplHeader['data'] = self.allFilterOption[popKey + '_cmp'];
        }
      }
      tmpField.push({ prop: popKey + '_cmp', draggable: false, name: showName, resizeable: true, width: item.width, ...tplHeader });
      if (self.viewTableData.time_grain == 'summary') {
        self.viewTableData['other_compare_date_list'].forEach((otherItem, key) => {
          const currentOtherCompareField = popKey + '_cmp' + key;
          tplHeader['summaryFunc'] = () => self.summaryData[currentOtherCompareField];
          tplHeader['summaryTemplate'] = self.summaryCell;
          tplHeader['summaryTemplateType'] = 'summaryCell';
          if (item['is_rate']) {
            tplHeader['summaryTemplate'] = self.rateSummaryCell;
            tplHeader['summaryTemplateType'] = 'rateSummaryCell';
          }

          if (self.allFilterOption.hasOwnProperty(popKey)) {
            if (self.allFilterOption.hasOwnProperty(currentOtherCompareField)) {
              tplHeader['data'] = self.allFilterOption[currentOtherCompareField];
            } else {
              self.allFilterOption[currentOtherCompareField] = {
                filterType: 'numberFilter',
                filterOption: [],
                filterKey: { key: currentOtherCompareField, data_type: item.data_type, name: otherItem.alias ? otherItem.alias + item.name + '#' : item.name + '#' + (key + 2), type: 'numberFilter' },
                filterResult: {},
              };
              tplHeader['data'] = self.allFilterOption[currentOtherCompareField];
            }
          }

          tmpField.push({ prop: currentOtherCompareField, draggable: false, name: otherItem.alias ? otherItem.alias + item.name + '#' : item.name + '#' + (key + 2), resizeable: true, width: item.width, ...tplHeader });

        });
      }

    }
    if (item.selected && item.selected['compare_abs']) {
      const showName = self.viewTableData['summary_date_compare_alias'] + item.name + '△';
      if (item['is_rate']) {
        tplHeader['cellTemplate'] = self.rateCellColor;
        tplHeader['summaryTemplate'] = self.rateSummaryCellColor;
        tplHeader['summaryTemplateType'] = 'rateSummaryCellColor';
        tplHeader['cellTemplateType'] = 'rateCellColor';
      } else {
        tplHeader['cellTemplate'] = self.cellColor;
        tplHeader['summaryTemplate'] = self.summaryCellColor;
        tplHeader['summaryTemplateType'] = 'summaryCellColor';
        tplHeader['cellTemplateType'] = 'cellColor';
      }
      tplHeader['summaryFunc'] = () => self.summaryData[popKey + '_abs'];

      if (self.allFilterOption.hasOwnProperty(popKey)) {
        if (self.allFilterOption.hasOwnProperty(popKey + '_abs')) {
          tplHeader['data'] = self.allFilterOption[popKey + '_abs'];
        } else {
          self.allFilterOption[popKey + '_abs'] = {
            filterType: 'numberFilter',
            filterOption: [],
            filterKey: { key: popKey + '_abs', data_type: item.data_type, name: showName, type: 'numberFilter' },
            filterResult: {},
          };
          tplHeader['data'] = self.allFilterOption[popKey + '_abs'];
        }
      }

      tmpField.push({ prop: popKey + '_abs', draggable: false, name: showName, resizeable: true, width: item.width, ...tplHeader });

      if (self.viewTableData.time_grain == 'summary') {
        self.viewTableData['other_compare_date_list'].forEach((otherItem, key) => {
          const currentOtherCompareField = popKey + '_abs' + key;
          tplHeader['summaryFunc'] = () => self.summaryData[currentOtherCompareField];
          tplHeader['summaryTemplate'] = self.summaryCellColor;
          tplHeader['cellTemplate'] = self.cellColor;
          tplHeader['summaryTemplateType'] = 'summaryCellColor';
          tplHeader['cellTemplateType'] = 'cellColor';
          if (item['is_rate']) {
            tplHeader['cellTemplate'] = self.rateCellColor;
            tplHeader['summaryTemplate'] = self.rateSummaryCellColor;
            tplHeader['summaryTemplateType'] = 'rateSummaryCellColor';
            tplHeader['cellTemplateType'] = 'rateCellColor';
          }

          if (self.allFilterOption.hasOwnProperty(popKey)) {
            if (self.allFilterOption.hasOwnProperty(currentOtherCompareField)) {
              tplHeader['data'] = self.allFilterOption[currentOtherCompareField];
            } else {
              self.allFilterOption[currentOtherCompareField] = {
                filterType: 'numberFilter',
                filterOption: [],
                filterKey: { key: currentOtherCompareField, data_type: item.data_type, name: otherItem.alias ? otherItem.alias + item.name + '△' : item.name + '△' + (key + 2), type: 'numberFilter' },
                filterResult: {},
              };
              tplHeader['data'] = self.allFilterOption[currentOtherCompareField];
            }
          }

          tmpField.push({ prop: currentOtherCompareField, draggable: false, name: otherItem.alias ? otherItem.alias + item.name + '△' : item.name + '△' + (key + 2), resizeable: true, width: item.width, ...tplHeader });

        });
      }
    }
    if (item.selected && item.selected['compare_rate']) {
      const showName = self.viewTableData['summary_date_compare_alias'] + item.name + '%';
      tplHeader['cellTemplate'] = self.rateCellColor;
      tplHeader['summaryFunc'] = () => self.summaryData[popKey + '_rat'];
      tplHeader['summaryTemplate'] = self.rateSummaryCellColor;
      tplHeader['summaryTemplateType'] = 'rateSummaryCellColor';
      tplHeader['cellTemplateType'] = 'rateCellColor';

      if (self.allFilterOption.hasOwnProperty(popKey)) {
        if (self.allFilterOption.hasOwnProperty(popKey + '_rat')) {
          tplHeader['data'] = self.allFilterOption[popKey + '_rat'];
        } else {
          self.allFilterOption[popKey + '_rat'] = {
            filterType: 'numberFilter',
            filterOption: [],
            filterKey: { key: popKey + '_rat', data_type: item.data_type, name: showName, type: 'numberFilter' },
            filterResult: {},
          };
          tplHeader['data'] = self.allFilterOption[popKey + '_rat'];
        }
      }
      tmpField.push({ prop: popKey + '_rat', draggable: false, name: showName, resizeable: true, width: item.width, cellTemplate: self.rateCell, ...tplHeader });

      if (self.viewTableData.time_grain == 'summary') {
        self.viewTableData['other_compare_date_list'].forEach((otherItem, key) => {
          const currentOtherCompareField = popKey + '_rat' + key;
          tplHeader['summaryFunc'] = () => self.summaryData[currentOtherCompareField];
          tplHeader['summaryTemplate'] = self.rateSummaryCellColor;
          tplHeader['cellTemplate'] = self.rateCellColor;
          tplHeader['summaryTemplateType'] = 'rateSummaryCellColor';
          tplHeader['cellTemplateType'] = 'rateCellColor';

          if (self.allFilterOption.hasOwnProperty(popKey)) {
            if (self.allFilterOption.hasOwnProperty(currentOtherCompareField)) {
              tplHeader['data'] = self.allFilterOption[currentOtherCompareField];
            } else {
              self.allFilterOption[currentOtherCompareField] = {
                filterType: 'numberFilter',
                filterOption: [],
                filterKey: { key: currentOtherCompareField, data_type: item.data_type, name: item.name + '%', type: 'numberFilter' },
                filterResult: {},
              };
              tplHeader['data'] = self.allFilterOption[currentOtherCompareField];
            }
          }

          tmpField.push({ prop: currentOtherCompareField, draggable: false, name: otherItem.alias ? otherItem.alias + item.name + '%' : item.name + '%' + (key + 2), resizeable: true, width: item.width, ...tplHeader });

        });
      }

    }
    if (item.selected && item.selected['avg'] && !item['is_rate']) {
      let showName = item.name;
      if (["pub_metric_data", "metric_data", "conversion_data"].indexOf(item.data_type) != -1) {
        showName = self.viewTableData['summary_date_alias'] + item.name + '日均';
      }
      delete tplHeader['cellTemplate'];
      if (item.type && item.type === 'number') {
        tplHeader['summaryFunc'] = () => self.summaryData[popKey + '_avg'];
        tplHeader['summaryTemplate'] = self.summaryCell;
        tplHeader['summaryTemplateType'] = 'summaryCell';
        if (item['is_rate']) {
          tplHeader['summaryTemplate'] = self.rateSummaryCell;
          tplHeader['cellTemplate'] = this.rateCellColor;
          tplHeader['summaryTemplateType'] = 'rateSummaryCell';
          tplHeader['cellTemplateType'] = 'rateCellColor';
        }
      }

      delete tplHeader['headerTemplate'];
      delete tplHeader['headerTemplateType'];

      tmpField.push({ prop: popKey + '_avg', draggable: false, sortable: false, name: showName, resizeable: true, width: item.width, ...tplHeader });

    }
    if (item.selected && item.selected['percentage'] && !item['is_rate']) {
      tplHeader['cellTemplate'] = self.progressCell;
      tplHeader['progressCell'] = true;
      let showName = item.name;
      if (["pub_metric_data", "metric_data", "conversion_data"].indexOf(item.data_type) != -1) {
        showName = self.viewTableData['summary_date_alias'] + item.name + '占比';
      }
      if (item.type && item.type === 'number') {
        tplHeader['summaryFunc'] = () => self.summaryData[popKey + '_per'];
        tplHeader['summaryTemplate'] = self.summaryCell;
        tplHeader['summaryTemplateType'] = 'summaryCell';
        if (item['is_rate']) {
          tplHeader['summaryTemplate'] = self.rateSummaryCell;
          tplHeader['summaryTemplateType'] = 'rateSummaryCell';
        }
      }

      delete tplHeader['headerTemplate'];
      delete tplHeader['headerTemplateType'];
      tmpField.push({ prop: popKey + '_per', originProp: popKey, draggable: false, sortable: false, name: showName, resizeable: true, width: 160, ...tplHeader });

    }
  });

  return hasCreative;
}


