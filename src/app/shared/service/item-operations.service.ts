import { Injectable } from '@angular/core';

@Injectable()
export class ItemOperationsService {

  private operations = {
    "string": [
      {key: "=", name: "为"},
      {key: "!=", name: "不为"},
      {key: "like", name: "包含"},
      {key: "notlike", name: "不包含"},
      {key: "start", name: "开头为"},
      {key: "end", name: "结尾为"}
    ],
    "number": [
      {key: "=", name: "="},
      {key: ">", name: ">"},
      {key: ">=", name: ">="},
      {key: "<", name: "<"},
      {key: "<=", name: "<="}
    ],
    "numberFilter": [
      {key: "=", name: "="},
      {key: "!=", name: "!="},
      {key: ">", name: ">"},
      {key: ">=", name: ">="},
      {key: "<", name: "<"},
      {key: "<=", name: "<="},
      {key: "between", name: "介于"}
    ],
    "timeFilter": [
      {key: "between", name: "介于"},
      {key: "<", name: "早于"},
      {key: ">", name: "晚于"},
    ],
    "dateFilter": [
      {key: "between", name: "介于"},
      {key: "<", name: "早于"},
      {key: ">", name: "晚于"},
    ],
    "single_select": [
      {key: "=", name: "为"},
      {key: "!=", name: "不为"}
    ],
    "multi_select": [
      {key: "=", name: "为"},
      {key: "!=", name: "不为"}
    ],

    "multiList": [
      {key: "in", name: "为"},
    ],
    'multiValue': [
      {key: "=", name: "为"},
      {key: "!=", name: "不为"},
      {key: "like", name: "包含"},
      {key: "notlike", name: "不包含"},
      {key: "start", name: "开头为"},
      {key: "end", name: "结尾为"}
    ],
    'singleList': [
      {key: "=", name: "为"}
    ],
    'checkboxList': [
      {key: "in", name: "为"}
    ],
    'multipleSelectList': [
      {key: "in", name: "为"}
    ]
  };

  constructor() { }

  getOperations() {
    return this.operations;
  }
}
