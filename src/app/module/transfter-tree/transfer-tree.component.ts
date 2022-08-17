import { deepCopy, isArray } from '@jzl/jzl-util';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import * as _ from 'lodash';

@Component({
  selector: 'nz-transfer-tree',
  templateUrl: './transfer-tree.component.html',
  styleUrls: ['./transfer-tree.component.scss']
})
export class TransferTreeComponent implements OnInit {
  @Input() limitKeyNum = 0;
  @Input() titles: string[] | TemplateRef<void>[] = ['源数据', '目的数据'];
  @Input() source: NzTreeNodeOptions[] = [];
  @Input() public target: string[] = [];
  @Input() showSearch = false;
  @Input() showRight = false;
  @Input() getParentKey = false;//获取子集key
  @Input() joinParents = false;//拼接父级信息
  @Input() canSearch = false;//是否可搜索
  @Input() footer: string[] | TemplateRef<void>[];
  @Input() treeExpandAll = false;
  @Input() nzSearchPlaceholder = '请输入要搜索的内容';
  @Output() readonly nzSearchChange = new EventEmitter<object>();
  @Output() readonly nzChange = new EventEmitter<any[]>();
  treeSearchValue = '';
  listSearchValue = '';
  listData: NzTreeNodeOptions[] = [];
  rightTreeData: any[] = [];
  rightTreeDataKey: string[] = [];
  listCheckedKeys: string[] = [];
  treeCheckedKeys: string[] = [];
  treeExpandedKeys: string[] = [];
  leafKeys: string[] = [];
  public searchText = '';//搜索词
  public noHaveText = '';//未匹配到的搜索词
  public loading = false;//未匹配到的搜索词
  private allKeys: any[] = [];

  @ViewChild('tree', { static: true }) private tree: NzTreeComponent;
  @ViewChild('rightTree') private rightTree: NzTreeComponent;

  public sourceData: NzTreeNodeOptions[] = [];
  private treeCheckedKeysTemp: string[] = [];
  private treeExpandedKeysTemp: string[] = [];

  constructor(private messageService: NzMessageService) { }

  ngOnInit() {
    this.sourceData = [...JSON.parse(JSON.stringify(this.source))];
    this.initData(this.sourceData);
    this.treeCheckedKeys = this.listData.map(item => item.key);
    // this.treeExpandedKeys = this.treeCheckedKeys;

    // setTimeout(()=> {
    //   this.allKeys = [];
    //   this.getTreeCheckedKeys(this.tree.getCheckedNodeList());
    //   this.treeCheckedKeys = this.allKeys.filter(key => this.leafKeys.indexOf(key) > -1);
    // });
  }

  initData(source: NzTreeNodeOptions[]) {
    source.map(item => {
      if (this.target.indexOf(item.key) > -1) {
        this.listData.push(item);
      }
      if (!item.children || item.children.length < 1) {
        this.leafKeys.push(item.key);
      } else {
        this.initData(item.children);
      }
    });
  }

  leftToRight() {
    this.target = this.treeCheckedKeys;
    this.listData = [];
    this.initData(this.tree.getTreeNodes());
    this.getResultData();
  }

  getResultData() {
    this.rightTreeData = [];
    const allRightTreeData = this.generateRightTree(this.sourceData);
    this.rightTreeData = allRightTreeData['tree'];
    if (this.joinParents) {
      this.moveChange(allRightTreeData);
    } else {
      this.moveChange(allRightTreeData['treeKey']);
    }
  }

  generateRightTree(source: any[]): { tree: any[], treeKey: any[], treeName: any[], joinKey: any[] } {
    const tree = [];
    let treeKey = [];
    let joinKey = [];
    let treeName = [];
    source.map(item => {
      if (item.checked && item.isLeaf) {
        tree.push({ ...item, checked: false });
        if (this.joinParents) {//拼接父级id,name
          const { parentIdList, parentNameList } = this.getParentInfoList(this.sourceData, item.key);
          const key = parentIdList.join('-');
          const name = parentNameList.join('-');
          treeKey.push(item.key);
          joinKey.push(key);
          treeName.push(name);
        } else {
          treeKey.push(item.key);
        }

      } else {
        if (item.hasOwnProperty('children') && item.children.length > 0) {
          const { tree: subTree, treeKey: subTreeKey, treeName: subTreeName, joinKey: subJoinKey } = this.generateRightTree(item.children);
          if (subTree.length > 0) {
            tree.push({ ...item, children: [...subTree], checked: false });
          }

          if (subTree.length === item.children.length && item.checked && this.getParentKey) {
            if (this.joinParents) {//拼接父级id,name
              const { parentIdList, parentNameList } = this.getParentInfoList(this.sourceData, item.key);
              const key = parentIdList.join('-');
              const name = parentNameList.join('-');
              treeKey = [...treeKey, ...[item.key]];
              joinKey = [...joinKey, ...[key]];
              treeName = [...treeName, ...[name]];
            } else {
              treeKey = [...treeKey, ...[item.key]];
            }
          } else {
            treeKey = [...treeKey, ...subTreeKey];
            joinKey = [...joinKey, ...subJoinKey];
            treeName = [...treeName, ...subTreeName];
          }
        }
      }
    });
    return { tree, treeKey, treeName, joinKey };
  }

  // 获取父级信息
  getParentInfoList(list, id) {
    if (!list || !id) {
      return null;
    }
    let parentIdList = [];
    let parentNameList = [];
    let findParent = (data, nodeId) => {
      for (var i = 0, length = data.length; i < length; i++) {
        let node = data[i];
        if (node.id === nodeId) {
          parentIdList.unshift(nodeId);
          parentNameList.unshift(node.name);
          if (nodeId === list[0].id) {
            break
          }
          findParent(list, node.parent_id);
          break
        } else {
          if (node.children) {
            findParent(node.children, nodeId);
          }
          continue
        }
      }
      return { parentIdList, parentNameList };
    }
    return findParent(list, id);
  }


  treeOnCheck(event: NzFormatEmitEvent): void {
    this.allKeys = [];
    this.getTreeCheckedKeys(this.tree.getCheckedNodeList());
    this.treeCheckedKeys = this.allKeys.filter(key => this.leafKeys.indexOf(key) > -1);
    this.rightTreeData = [];
    const allRightTreeData = this.generateRightTree(this.sourceData);
    this.rightTreeData = allRightTreeData['tree'];

    if (this.limitKeyNum > 0 && allRightTreeData['treeKey'].length > this.limitKeyNum) {


      this.treeCheckedKeys = [...JSON.parse(JSON.stringify(this.treeCheckedKeysTemp))];


      this.messageService.error("所选项不能超过" + this.limitKeyNum);
    } else {

      this.treeCheckedKeysTemp = JSON.parse(JSON.stringify(this.treeCheckedKeys));
      if (this.joinParents) {
        this.moveChange(allRightTreeData);
      } else {
        this.moveChange(allRightTreeData['treeKey']);
      }
    }

  }



  treeOnCheckAll(e: boolean) {
    if (e) {
      if (this.limitKeyNum > 0 && this.leafKeys.length > this.limitKeyNum) {
        this.messageService.error("所选项不能超过" + this.limitKeyNum);
        return;
      }
      this.treeCheckedKeys = this.leafKeys;
      this.treeCheckedKeysTemp = JSON.parse(JSON.stringify(this.treeCheckedKeys));
    } else {
      this.treeCheckedKeys = [];
      this.treeCheckedKeysTemp = JSON.parse(JSON.stringify(this.treeCheckedKeys));
    }

    setTimeout(() => {
      this.getResultData();
    }, 0);
  }

  listOnCheck(e: boolean, checkedKeys: string[]) {
    if (e) {
      this.listCheckedKeys = _.uniq([...this.listCheckedKeys, ...checkedKeys]);
    } else {
      this.listCheckedKeys = this.listCheckedKeys.filter(key => checkedKeys.indexOf(key) < 0);
    }
  }


  getTreeCheckedKeys(source: NzTreeNode[]) {
    source.map(item => {
      if (item.isChecked) {
        this.allKeys.push(item.key);
      }
      if (item.children.length > 0) {
        this.getTreeCheckedKeys(item.children);
      }
    });
  }

  get getLeftDisabled(): boolean {
    return _.difference(this.listData.map(item => item.key), this.treeCheckedKeys).length === 0 &&
      _.difference(this.treeCheckedKeys, this.listData.map(item => item.key)).length === 0;
  }

  showListSearchValue(item: NzTreeNodeOptions): boolean {
    return this.listSearchValue.length > 0 && item.title.indexOf(this.listSearchValue) > -1;
  }

  listSearch(e) {
    this.listSearchValue = e.target.value;
    this.searchChange(this.listSearchValue, 'list');
  }

  treeSearch(e) {
    this.treeSearchValue = e.target.value;
    this.searchChange(this.treeSearchValue, 'tree');
  }

  searchChange(value: string, type: 'list' | 'tree') {
    this.nzSearchChange.emit({ value, type });
  }

  moveChange(value) {
    this.nzChange.emit(value);
  }

  //添加搜索词
  addSearchOption(source, target) {
    const copySearchText = this.searchText;
    const inputValueAry = this.searchText.split(/[\s,\/]+/g); // 根据换行或者回车进行识别
    inputValueAry.forEach((item, idx) => {
      if (!item) {
        inputValueAry.splice(idx, 1);
      }
    });

    const selectedValues = {};// 已选正确搜索词
    inputValueAry.forEach(value => {
      this.searchOptionPush(value, source, target, selectedValues);
    });
    deepCopy(inputValueAry).forEach(value => {
      if (selectedValues[value]) {
        inputValueAry.splice(inputValueAry.indexOf(value), 1);
      }
    });

    this.searchText = inputValueAry.join('\n');
    this.noHaveText = this.searchText + '';

    if (copySearchText) {
      this.listData.length = 0;
      this.leafKeys.length = 0;
      this.initData(this.sourceData);
      this.treeCheckedKeys = this.listData.map(item => item.key);
      setTimeout(() => {
        this.getResultData();
      }, 0);
    }
  }

  // 添加搜索词
  searchOptionPush(inputValue, source, target, selectedValues) {
    source.forEach(item => {
      if (inputValue === item.title) {
        selectedValues[item.title] = true;
        if (!this.getParentKey) {
          if (target.indexOf(item.key) === -1) {//未被选
            this.searchItemPush([item], target);
          }
        } else {
          if (target.indexOf(item.key) === -1 && target.indexOf(item.parent_id) === -1) {//未被选
            target.push(item.key);
          }
        }
      } else {
        if (isArray(item.children) && item.children.length > 0) {
          this.searchOptionPush(inputValue, item.children, target, selectedValues);
        }
      }
    });
  }

  // 添加搜索词子集
  searchItemPush(cityList, target) {
    cityList.forEach(item => {
      if (isArray(item.children) && item.children.length > 0) {
        return this.searchItemPush(item.children, target);
      } else {
        if (target.indexOf(item.key) === -1) {
          target.push(item.key);
        }
      }
    });
  }
}
