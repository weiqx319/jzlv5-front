import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rankingStatus'
})
export class RankingStatusPipe implements PipeTransform {
  private status = {
    '0': "未设置",
    '1': "未运行",
    '4': "已完成",
    "5": "已过期",
    // '3': "已修改",
    '2': "运行中(全部)",
    '20000': "运行中",
    '20001': "运行中(出价下限过高)",
    '20002': "运行中(出价上限过低)",
    '20005': "地域不匹配",
    '20006': "运行中(不在竞价时段)",
    '20007': "运行中(成功)",
    '21011': "账户预算不足",
    '21022': "账户余额为零",
    '22022': "运行中(计划暂停时段)",
    '22023': "计划暂停推广",
    '22024': "计划预算不足",
    '23032': "单元暂停推广",
    '24042': "关键词暂停推广",
    '24900': "关键词已删除",
    '40001': "已完成(已过期)",
  };

  transform(value: any, args?: any): any {
    const input = isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10);
    return input > 0 ? this.status[input] : "未设置";
  }

}
