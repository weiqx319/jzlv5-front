import { Injectable, OnInit } from '@angular/core';
import { ProductDataService } from "@jzl/jzl-product";

@Injectable()
export class ManageItemService {
  public productInfo = {};
  public task_id = null;

  constructor(private productService: ProductDataService) {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
      if (this.productInfo['name'] === '大搜家') {
        this.roleTypeRelation = {
          role_1: '管理员',
          role_2: '事业部负责人',
          role_3: '营销总监/服务商负责人',
          role_4: '营销经理/服务商优化师',
          role_7: '素材管理员'
        };

        this.roleTypeList = [
          { name: '营销经理/服务商优化师', key: 4 },
          { name: '营销总监/服务商负责人', key: 3 },
          { name: '事业部负责人', key: 2 },
          { name: '素材管理员', key: 7 }
        ];

        this.roleTypeList3 = [
          { name: '营销经理/服务商优化师', key: 4 },
        ];

        this.roleAllTypeList = [
          { name: '营销经理/服务商优化师', key: 4 },
          { name: '营销总监/服务商负责人', key: 3 },
          { name: '事业部负责人', key: 2 },
          { name: '管理员', key: 1 },
          { name: '素材管理员', key: 7 }
        ];
      }
    });
  }

  public roleTypeRelation = {
    role_1: '管理员',
    role_2: '事业部负责人',
    role_3: '优化经理',
    role_4: '优化师',
    role_7: '素材管理员'
  };

  public roleTypeList = [
    { name: '优化师', key: 4 },
    { name: '优化经理', key: 3 },
    { name: '事业部负责人', key: 2 },
    { name: '素材管理员', key: 7 }
  ];

  public roleTypeList3 = [
    { name: '优化师', key: 4 },
  ];

  public roleAllTypeList = [
    { name: '优化师', key: 4 },
    { name: '优化经理', key: 3 },
    { name: '事业部负责人', key: 2 },
    { name: '管理员', key: 1 },
    { name: '素材管理员', key: 7 }
  ];

  public isUserList = [{ name: '无效', key: 0 }, { name: '有效', key: 1 }];

  public AccountStatusList = [
    { name: '无效', key: -1 },
    { name: '有效', key: 0 }
  ];


  public childAccountStatusList = [
    { name: '验证失败', key: -1 },
    { name: '待验证', key: 1 },
    { name: '有效(未授权)', key: 2 },
    { name: '已授权(未关联)', key: 3 },
    { name: '已关联', key: 4 }
  ];



  public publisherTypeRelation = {
    publisher_id_1: '百度',
    publisher_id_2: '搜狗',
    publisher_id_3: '360',
    publisher_id_4: '神马',
    publisher_id_6: '广点通',
    publisher_id_7: '今日头条',
    publisher_id_17: '超级汇川',
  };


  public publisherTypeList = [
    { name: '百度', key: 1 },
    { name: '搜狗', key: 2 },
    { name: '360', key: 3 },
    { name: '神马', key: 4 },
    { name: '广点通', key: 6 },
    { name: '今日头条', key: 7 },
    { name: '超级汇川', key: 17 },
  ];

  public metricPublishItems = {
    'channel_1': [
    ],
    'channel_2': [
      { publisher_name: '百度', publisher_id: 1 },
      { publisher_name: '广点通', publisher_id: 6 },
      { publisher_name: '头条', publisher_id: 7 },
      { publisher_name: '微信公众平台', publisher_id: 9 },
      { publisher_name: '360', publisher_id: 3 },
      { publisher_name: 'facebook', publisher_id: 11 },
      { publisher_name: '快手', publisher_id: 16 },
      { publisher_name: '超级汇川', publisher_id: 17 },
      { publisher_name: '知乎', publisher_id: 18 },
    ],
    'channel_3': [
      { publisher_name: '小米', publisher_id: 13 },
      { publisher_name: 'OPPO', publisher_id: 14 },
      { publisher_name: 'VIVO', publisher_id: 15 },
    ]
  };

  public advertiserTypeRelation = {
    'advertiser_type_1': '教育',
    'advertiser_type_2': '互联网',
    'advertiser_type_3': '医疗',
    'advertiser_type_4': '游戏',
    'advertiser_type_6': '招商',
    'advertiser_type_7': '房地产',
    'advertiser_type_5': '其他'
  };

  public advertiserTypeList = [
    { name: '教育', key: 1 },
    { name: '互联网', key: 2 },
    { name: '医疗', key: 3 },
    { name: '游戏', key: 4 },
    { name: '招商', key: 6 },
    { name: '房地产', key: 7 },
    { name: '其他', key: 5 }
  ];

  public TaskStatusList = [
    { name: '待处理', key: 0 },
    { name: '处理中', key: 1 },
    { name: '部分成功', key: 2 },
    { name: '成功', key: 3 },
    { name: '失败', key: 4 },
    { name: '忽略', key: 5 },
  ];

  public TaskCronStatusList = [
    { name: '待运行', key: 0 },
    { name: '已运行', key: 1 },
    { name: '已中止', key: 2 },
  ];


  public TaskCronOpLevelList = [
    { name: '计划', key: 'campaign' },
    { name: '单元', key: 'adgroup' },
    { name: '关键词', key: 'keyword' },
    { name: '创意', key: 'creative' },
  ];

  public operationTypeList = [
    { name: '增加', key: 1 },
    { name: '修改', key: 2 },
    { name: '删除', key: 3 }
  ];

  public operationLevelList = [
    { name: '账户', key: 1 },
    { name: '计划', key: 2 },
    { name: '单元', key: 3 },
    { name: '关键词', key: 4 },
    { name: '创意', key: 5 }
  ];

}
