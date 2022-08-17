import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rankingAlertType'
})
export class RankingAlertTypePipe implements PipeTransform {

  private  status = {
    '0': '正常',
    '1': '出价下限过高',
    '2': '出价上限过低',
    '5': '地域不匹配',
    '7': '成功',
    '1011': '预算不足',
    '1022': '余额为零',
    '2022': '推广计划处于暂停时段',
    '2023': '推广计划暂停推广',
    '2024': '推广计划预算不足',
    '2900': '推广计划已删除',
    '3032': '推广单元暂停推广',
    '3900': '推广单元已删除',
    '4042': '关键词暂停推广',
    '4900': '关键词已删除'
  };
  transform(value: any, args?: any): any {
    return this.status[value];
  }

}
