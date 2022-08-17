import {Component, Input, OnInit} from '@angular/core';
import {NzModalService} from "ng-zorro-antd/modal";
import {deepCopy, isObject} from "@jzl/jzl-util";
import {LaunchMaterialVideoModalComponent} from "../../../../../modal/launch-material-video-modal/launch-material-video-modal.component";
import {LaunchMaterialImageModalComponent} from "../../../../../modal/launch-material-image-modal/launch-material-image-modal.component";
import {LaunchTitleModalComponent} from "../../../../../modal/launch-title-modal/launch-title-modal.component";

@Component({
  selector: 'app-creative-group-template-uc',
  templateUrl: './creative-group-template-uc.component.html',
  styleUrls: ['./creative-group-template-uc.component.scss']
})
export class CreativeGroupTemplateUcComponent implements OnInit {

  @Input() defaultData;
  @Input() checkErrorTip;
  @Input() sourceData;

  public cssTypeObj={
    1:[1,2,3,4],
    2:2,
    3:[1,2],
  };


  constructor(
    private modalService: NzModalService,
  ) { }

  ngOnInit(): void {
    if (this.sourceData['materials'].length===0) {
      this.addCreativeGroup(this.sourceData['materials']);
    }
  }

  addCreativeGroup(source) {
    const data=deepCopy(this.defaultData.template_struct.material.material_type_temp);
    source.push(data);
  }
  copyCreativeGroup(data,source) {
    const copyData=deepCopy(data);
    source.push(copyData);
  }
  deleteCreativeGroup(index,source) {
    if (source.length>index) {
      source.splice(index,1);
      this.getMaterialErrorTip();
    }
  }
  clearAllSelected(data: any[]) {
    data.splice(0, data.length);
    this.getMaterialErrorTip();
  }
  clearSingleSelected(data: any[], index: number, type) {
    data.splice(index, 1);
    this.getMaterialErrorTip();
  }

  // 打开素材库
  openMaterials(data,tempData,isBatch?: boolean) {
    if (!data) {
      data=this.sourceData['materials'][0].limit[0];
      tempData=this.defaultData.template_struct.material.material_type_temp.limit[0];
    }
    if (data.type==='video') {
      this.addMaterials(data.list,tempData,isBatch);
    } else {
      this.addImageMaterials(data.list,tempData,isBatch);
    }
  }


  addMaterials(data: any[],source,isBatch) {
    const maxNum=this.defaultData.template_struct.material.material_type_temp.num;
    const add_modal = this.modalService.create({
      nzTitle: '视频素材库',
      nzWidth: 1300,
      nzContent: LaunchMaterialVideoModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: isBatch?[]:data,
        cssType:this.cssTypeObj[source.css_type],
        maxSelect:isBatch?null:maxNum
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        result['data'].forEach(item => {
          if (!item.hasOwnProperty("title")) {
            item["title"] = [];
          }
        });
        if (isBatch) {
          this.batchAssignMaterial(0,maxNum,result['data'],this.sourceData['materials'],0,source.css_type);
        } else {
          data.splice(0, data.length, ...result['data']);
        }
        this.getMaterialErrorTip();
      }
    });
  }


  // 图片素材库
  addImageMaterials(data: any[], source,isBatch) {
    let tempData = [];
    const maxNum = this.cssTypeObj[source.css_type] == 2?15:this.defaultData.template_struct.material.material_type_temp.num;
    if (data.length && this.cssTypeObj[source.css_type] === 2) {
      for (let i = 0; i < data.length; i++) {
        tempData.push(...data[i].materials);
      }
    } else {
      tempData = data;
    }
    const add_modal = this.modalService.create({
      nzTitle: '图片素材库',
      nzWidth: 1300,
      nzContent: LaunchMaterialImageModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList:  isBatch?[]:tempData,
        cssType:this.cssTypeObj[source.css_type],
        maxSelect:isBatch?null:maxNum
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        if (this.cssTypeObj[source.css_type] !== 2) {
          result['data'].forEach(item => {
            if (!item.hasOwnProperty("title")) {
              item["title"] = [];
            }
          });
          if (isBatch) {
            this.batchAssignMaterial(0,this.defaultData.template_struct.material.material_type_temp.num,result['data'],this.sourceData['materials'],0,source.css_type);
          } else {
            data.splice(0, data.length, ...result['data']);
          }
        } else if (this.cssTypeObj[source.css_type] === 2) {
          const resultData = [];
          for (let i = 0; i < [...result['data']].length; i += 3) {
            resultData.push({ materials: [...result['data']].slice(i, i + 3), title: [] });
          }
          if (isBatch) {
            this.batchAssignMaterial(0,this.defaultData.template_struct.material.material_type_temp.num,resultData,this.sourceData['materials'],0,source.css_type);
          } else {
            data.splice(0, data.length, ...resultData);
          }
        }
        this.getMaterialErrorTip();
      }
    });
  }


  // 标题库
  addLaunchTitle(data: any[],maxNum?) {
    const add_modal = this.modalService.create({
      nzTitle: '选择标题库',
      nzWidth: 1300,
      nzContent: LaunchTitleModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: data,
        maxSelect:maxNum||null
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        data.splice(0, data.length, ...result['data']);
        this.getMaterialErrorTip();
      }
    });
  }
  // 批量添加标题
  batchAddTitle(type,maxNum) {
    const maxSelect=maxNum*this.sourceData['materials'].length.toFixed(0);
    const add_modal = this.modalService.create({
      nzTitle: '选择标题库',
      nzWidth: 1300,
      nzContent: LaunchTitleModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        maxSelect:maxSelect
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        this.batchAssignTitle(0,maxNum,result['data'],this.sourceData['materials'],0,type);
        this.getMaterialErrorTip();
      }
    });
  }
  batchAssignMaterial(beginIndex,num,sourceData,data,curIndex,cssType) {
    if (!data[curIndex]) {
      data[curIndex]=deepCopy(this.defaultData.template_struct.material.material_type_temp);
    }
    const curData=data[curIndex].limit.find(item=>item.css_type==cssType);
    const curLength=curData.list.length;
    const lastIndex=curLength>0?beginIndex+num-curLength:beginIndex+num;
    const resultData=sourceData.slice(beginIndex,lastIndex);
    curData.list=[...curData.list,...resultData].slice(0,num);
    if (lastIndex<sourceData.length) {
      this.batchAssignMaterial(lastIndex,num,sourceData,data,curIndex+1,cssType);
    }
  }
  batchAssignTitle(beginIndex,num,sourceData,data,curIndex,type) {
    if (!data[curIndex][type]) {
      data[curIndex][type]=[];
    }
    const curLength=data[curIndex][type].length;
    const lastIndex=curLength>0?beginIndex+num-curLength:beginIndex+num;
    const resultData=sourceData.slice(beginIndex,lastIndex);
    data[curIndex][type]=[...data[curIndex][type],...resultData].slice(0,num);
    if (lastIndex<sourceData.length&&curIndex+1<data.length) {
      this.batchAssignTitle(lastIndex,num,sourceData,data,curIndex+1,type);
    } else if (lastIndex>=sourceData.length&&curIndex+1<data.length) {
      this.batchAssignTitle(0,num,sourceData,data,curIndex+1,type);
    }
  }
  // 素材选取错误验证
  getMaterialErrorTip() {
    // 素材选取
    const materialList = [];
    const materialTitleList = [];
    const titleList = [];
    const template = this.defaultData.template_struct.material.material_type_temp;
    if (this.defaultData.template_struct.material.by_material_set_title) {
      if (this.sourceData['materials'].length <= 0) {
        materialTitleList.push(true);
      } else {
        for (const s_item of this.sourceData['materials']) {
          let noMaterialNum = 0;
          for (const limit of s_item.limit) {
            if (limit.list.length <= 0) {
              noMaterialNum++;
            } else {
              limit.list.forEach(material => {
                if (material.title.length <= 0 || material.title[0].length > 55) {
                  materialTitleList.push(true);
                }
              });
            }
          }
          if (noMaterialNum >= s_item.limit.length) {
            materialTitleList.push(true);
          }
        }
      }
    } else {
      if (this.sourceData['materials'].length <= 0) {
        materialList.push(true);
      } else {
        for (const s_item of this.sourceData['materials']) {
          let noMaterialNum = 0;
          for (const limit of s_item.limit) {
            if (limit.list.length <= 0) {
              noMaterialNum++;
            }
            if (limit.list.length < limit.min) {
              materialList.push(true);
            }
          }
          if (noMaterialNum >= s_item.limit.length) {
            materialList.push(true);
          }
          if (this.defaultData.template_struct.material.by_creative_group_set_title&&(!s_item.titles||s_item.titles.length<=0)) {
            materialTitleList.push(true);
          }
        }
      }
    }

    if (materialList.some((item) => item)) {
      this.checkErrorTip.material_lst.is_show = true;
    } else {
      this.checkErrorTip.material_lst.is_show = false;
    }

    if (titleList.some((item) => item)) {
      this.checkErrorTip.title_lst.is_show = true;
    } else {
      this.checkErrorTip.title_lst.is_show = false;
    }

    if (materialTitleList.some((item) => item)) {
      this.checkErrorTip.material_title_lst.is_show = true;
    } else {
      this.checkErrorTip.material_title_lst.is_show = false;
    }

  }

}
