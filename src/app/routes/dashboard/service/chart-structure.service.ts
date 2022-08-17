import { Injectable } from '@angular/core';

@Injectable()
export class ChartStructureService {
  private line_init_structure = {
    "chart_name": "",
    "chart_type": "line",
    "summary_type": "publisher",
    "date_range": "day:1:6",
    "data_range": {
      "select_type": 'publisher',
      "select_data": []
    },
    "metrics": [
      {
        "id": 1,
        "key": "data_date",
        "name": "时间",
        "type": "line",
        "is_x": true,
        "order": 0
      },
      {
        "id": 2,
        "key": "pub_impression",
        "name": "展现",
        "type": "line",
        "is_x": false,
        "order": 0
      }
    ],
  /*  "conditions": [
      {
        "key": "",
        "value": "",
        "name": "",
        "op": "",
        "type": ""
      }
    ]*/
  };

  private line_stack_init_structure = {
    "chart_name": "",
    "chart_type": "lineStack",
    "summary_type": "publisher",
    "date_range": "day:1:6",
    "data_range": {
      "select_type": 'publisher',
      "select_data": []
    },
    "metrics": [
      {
        "id": 1,
        "key": "data_date",
        "name": "时间",
        "type": "line",
        "is_x": true,
        "order": 0
      },
      {
        "id": 2,
        "key": "pub_impression",
        "name": "展现",
        "type": "line",
        "is_x": false,
        "order": 0
      }
    ],
  /*  "conditions": [
      {
        "key": "",
        "value": "",
        "name": "",
        "op": "",
        "type": ""
      }
    ]*/
  };

  private bar_init_structure = {
    "chart_name": "",
    "chart_type": "bar",
    "summary_type": "publisher",
    "date_range": "day:1:6",
    "data_range": {
      "select_type": 'publisher',
      "select_data": []
    },
    "metrics": [
      {
        "id": 1,
        "key": "device",
        "name": "设备",
        "field_name_key": "device",
        "type": "bar",
        "is_x": true,
        "order": 0
      },
      {
        "id": 2,
        "key": "pub_impression",
        "name": "展现",
        "type": "bar",
        "is_x": false,
        "order": 0
      }
    ],
  /*  "conditions": [
      {
        "key": "",
        "value": "",
        "name": "",
        "op": "",
        "type": ""
      }
    ]*/
  };

  private pie_init_structure = {
    "chart_name": "",
    "chart_type": "pie",
    "summary_type": "publisher",
    "date_range": "day:1:6",
    "data_range": {
      "select_type": 'publisher',
      "select_data": []
    },
    "metrics": [
      {
        "id": 1,
        "key": "pub_impression",
        "name": "展现",
        "type": "line",
        "is_x": false,
        "order": 0
      }
    ],
   /* "conditions": [
      {
        "key": "",
        "value": "",
        "name": "",
        "op": "",
        "type": ""
      }
    ]*/
  };

  private card_init_structure = {
    "chart_name": "",
    "chart_type": "card",
    "summary_type": "publisher",
    "date_range": "day:1:6",
    "data_range": {
      "select_type": 'publisher',
      "select_data": []
    },
    "metrics": [
      {
        "id": 1,
        "key": "pub_impression",
        "name": "展现",
        "type": "line",
        "is_x": false,
        "order": 0
      }
    ],
    /* "conditions": [
       {
         "key": "",
         "value": "",
         "name": "",
         "op": "",
         "type": ""
       }
     ]*/
  };

  private funnel_init_structure = {
    "chart_name": "",
    "chart_type": "funnel",
    "summary_type": "publisher",
    "date_range": "day:1:6",
    "data_range": {
      "select_type": 'publisher',
      "select_data": []
    },
    "metrics": [
      {
        "id": 1,
        "key": "pub_impression",
        "name": "展现",
        "type": "line",
        "is_x": false,
        "order": 0
      }
    ],
    /* "conditions": [
       {
         "key": "",
         "value": "",
         "name": "",
         "op": "",
         "type": ""
       }
     ]*/
  };

  private map_init_structure = {
    "chart_name": "",
    "chart_type": "map",
    "summary_type": "publisher",
    "date_range": "day:1:6",
    "data_range": {
      "select_type": 'publisher',
      "select_data": []
    },
    "metrics": [
      {
        "id": 1,
        "key": "pub_impression",
        "name": "展现",
        "type": "line",
        "is_x": false,
        "order": 0
      }
    ],
  };

  private init_structure = {
    "line": this.line_init_structure,
    "lineStack": this.line_stack_init_structure,
    "bar": this.bar_init_structure,
    "pie": this.pie_init_structure,
    "card": this.card_init_structure,
    "funnel": this.funnel_init_structure,
    "map": this.map_init_structure
  };

  constructor() { }

  getChartStructure(type) {
    // return Object.assign({}, ...this.init_structure[type]);
    // todo deep copy
    return JSON.parse(JSON.stringify(this.init_structure[type]));
  }
}
