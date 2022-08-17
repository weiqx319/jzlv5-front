import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rankingModel'
})
export class RankingModelPipe implements PipeTransform {

  private rankingModelSetting = {
    'model_0': '未设置',
    'model_1': '单次',
    'model_2': '循环',
  };

  transform(value: any, args?: any): any {

    return this.rankingModelSetting['model_' + value ];
  }




}
