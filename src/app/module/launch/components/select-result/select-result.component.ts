import {AfterViewInit, Component, Input, OnChanges, OnInit} from '@angular/core';
import {deepCopy} from "@jzl/jzl-util";

@Component({
  selector: 'app-select-result',
  templateUrl: './select-result.component.html',
  styleUrls: ['./select-result.component.scss']
})
export class SelectResultComponent implements OnInit {

  @Input() data;
  @Input() adgroup;
  @Input() isEdit;
  @Input() industryList;
  @Input() selectNum;
  @Input() maxSelect;

  public s_category = [];

  public s_s_category = [];

  public resultData = [];

  public industryNumber = 0;

  constructor() { }

  ngOnInit() {
    this.industryNumber = this.data.industry.length;
    if(this.isEdit) {
      this.data.industry.forEach(item => {
        this.findParent(this.industryList, item, 'add');
      });
      this.getChild(this.industryList[0]);
      this.getChild(this.industryList[0]['children'][0]);
    }
  }

  getChild({ id, level }) {
    if(level === 1) {
      const data = this.industryList.find(item =>item.id === id);
      this.s_category = data.children;
    } else if(level === 2) {
      const data = this.s_category.find(item =>item.id === id);
      this.s_s_category = data.children;
    }
  }

  initData(data) {
    for ( const item of data ) {
      if(!Reflect.has(item, 'children')) {
        item.checked = false;
      } else {
        this.initData(item.children);
      }
    }
  }

  changeChecked(data) {
    const { id, checked  } = data;
    const index = this.data.resultData.findIndex(item => item.id === id);
    if(!checked ) {
      this.data.resultData.splice(index , 1);
    }
    if(checked && index === -1) {
      this.data.resultData.push(data);
    }
    this.data.industry = this.data.resultData.map(item => item.id);
    this.industryNumber = this.data.resultData.length;
    this.data.selectNum = "已选择" + this.data.industry.length + '个';
  }

  findParent(data, id, type) {
    for ( const item of data) {
      if(Reflect.has(item, 'children')) {
        this.findParent(item.children, id, type);
      } else {
        if( item.id === id ) {
          if(type === 'delete') {
            item.checked = false;
            this.data.resultData.splice(this.data.resultData.findIndex(value =>value.id === id) ,1 );
          } else {
            item.checked = true;
          }

        }
      }
    }
  }

  deleteTag({ id }) {
    this.findParent(this.industryList, id, 'delete');
    this.data.industry = this.data.resultData.map(item => item.id);
    this.industryNumber = this.data.resultData.length;
    this.data.selectNum = "已选择" + this.data.industry.length + '个';
  }

  clear() {
    this.data.resultData = [];
    this.data.industry = [];
    this.initData(this.industryList);
    this.industryNumber = this.data.resultData.length;
    this.data.selectNum = "已选择" + this.data.industry.length + '个';
  }

}
