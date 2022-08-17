import {
  Component, ElementRef, EventEmitter, Input, OnInit, OnChanges, Output, ViewChild,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss']
})
export class AddAccountComponent implements OnInit, OnChanges {


  _selectedLists = [];
  _selectedListsBackup = [];
  item_desc = [];
  _isAllSelected = false;
  lists = [];
  list = [];

  @Input() set displayList(data: {id: number, name: string}[]) {
    this.lists = data.map(item => {
      return Object.assign({}, item);
    });
  }

  @Input() type;

  @Input() set results(data: any[]) {
    this._selectedLists = data;
    this._selectedListsBackup = JSON.parse(JSON.stringify(data));
  }
  @Output() resultsChange:  EventEmitter<any>  = new EventEmitter<any>();




  @Output() selectedValueChanged: EventEmitter<object> = new EventEmitter<any>();

  @ViewChild('item', { static: true }) itemNode: ElementRef;
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.ngOnInit();
  }

  ngOnInit() {
    const list_obj = {};
    this._selectedLists.forEach(item => {
      list_obj[item] = true;
    });

 /*   this.lists.forEach(item => {
      if (item.id in list_obj) {
        this.item_desc.push(item.name);
        item.is_selected = true;
      } else {
        item.is_selected = false;
      }
    });*/
    // this._isAllSelected = this.lists.every(value => value.is_selected === true);
    this.list = []; //清空数组
    this.item_desc = [];
    this.lists.forEach(item => {
      if (item.id in list_obj) {
        this.item_desc.push(item.name);
        item.is_selected = true;

        this.list.push({
          id        : item.id,
          title      : item.name,
          direction  : 'right'
        });
      } else {
        item.is_selected = false;
        this.list.push({
          id        : item.id,
          title      : item.name,
          direction  : 'left'
        });
      }
    });
    this.refreshValues();
  }


  refreshValues(): void {
    this.item_desc = [];
    this.lists.forEach(item => {
      this._selectedLists.forEach(lis => {
        if (item.id === lis) {
          this.item_desc.push(item.name);
        }
      });

    });
  }




  allSelectedChange() {
    this.item_desc = [];
    this._isAllSelected = !this._isAllSelected;
    this.lists.forEach(item => {
      item.is_selected = this._isAllSelected;
      if (item.is_selected) {
        this.item_desc.push(item.name);
      }
    });
  }

  accountChange(i) {
    this.item_desc = [];
    this.lists[i].is_selected = !this.lists[i].is_selected;
    this._isAllSelected = this.lists.every(item => item.is_selected === true);
    this.lists.forEach(item => {
      if (item.is_selected) {
        this.item_desc.push(item.name);
      }
    });
  }
  selectItem(ret: {}): void {

    if (ret['from'] === 'left') { //从左到右
      ret['list'].forEach(item => {
        this._selectedLists.push(item.id);
      });
    } else if (ret['from'] === 'right') { //从右到左
      const newValue = [];
      this._selectedLists.forEach(item => {
        const comparItem = ret['list'].find((opt, index) => {
          return opt.id === item;
        });
        if (!comparItem) {
          newValue.push(item);
        }
      });
      this._selectedLists = newValue;
    }
    this.refreshValues();
  }

  cancel() {
    this._selectedLists = this._selectedListsBackup;
    this.ngOnInit();
    this.itemNode.nativeElement.style.display = 'none';
    this.itemNode.nativeElement.style.position = 'static';
    this.itemNode.nativeElement.parentNode.querySelector('.item-select').style.borderBottom = '1px solid #e4e4e4';
  }

  done() {
  /*  this._selectedLists = [];
    this.lists.forEach(item => {
      if (item.is_selected) {
        this._selectedLists.push(item.id);
      }
    });*/
    this._selectedListsBackup = this._selectedLists;
    this.itemNode.nativeElement.style.display = 'none';
    this.itemNode.nativeElement.style.position = 'static';
    this.itemNode.nativeElement.parentNode.querySelector('.item-select').style.borderBottom = '1px solid #e4e4e4';
    this.selectedValueChanged.emit(this._selectedLists);
    this.resultsChange.emit(this._selectedLists);
    this.ngOnInit();

    // this[this.operate_type + 'Selected'].emit(this.selected_lists);
  }

}
