import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2, SimpleChanges
} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";
import { Subscriber } from "rxjs";
import { BookmarkService } from "../service/bookmark.service";
import { MenuService } from '../../../core/service/menu.service';
@Component({
  selector: 'app-view-bookmark',
  templateUrl: './view-bookmark.component.html',
  styleUrls: ['./view-bookmark.component.scss']
})
export class ViewBookmarkComponent implements OnInit, OnDestroy, OnChanges {
  private list$;
  public activeBookMarkId = 0;
  public markList: any[];
  @Input() summaryType = 'keyword';
  @Input() relationId = '';
  @Input() fixTop = 0;
  @Output() create = new EventEmitter();
  @Output() save = new EventEmitter();
  @Output() selected = new EventEmitter();
  private markLoading = false;

  constructor(private el: ElementRef,
    private renderer: Renderer2,
    private bookMarkService: BookmarkService,
    public menuService: MenuService,
    private _message: NzMessageService) { }

  ngOnInit() {
    this.fixTop = this.fixTop - 20;
    this.refreshList();
    if (this.el.nativeElement.children.length > 0) {
      this.renderer.setStyle(this.el.nativeElement.children[0], 'top', this.fixTop + 'px');
      // this.renderer.setStyle(this.el.nativeElement.children[0], 'height', "calc(100vh - " + this.fixTop + " px)");
      this.renderer.setStyle(this.el.nativeElement.children[0].querySelector('.right-sidebar'), 'height', "calc(100vh - 80px - " + this.fixTop + "px)");
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fixTop']) {
      if (this.el.nativeElement.children.length > 0) {
        this.renderer.setStyle(this.el.nativeElement.children[0], 'top', this.fixTop + 'px');
        // this.renderer.setStyle(this.el.nativeElement.children[0], 'height', "calc(100vh - " + this.fixTop + "px - 60px)");
        this.renderer.setStyle(this.el.nativeElement.children[0].querySelector('.right-sidebar'), 'height', "calc(100vh - 80px -  " + this.fixTop + "px)");
      }
    }
  }


  refreshList() {
    this.list$ = this.bookMarkService.getBookMarkList({ summary_type: this.summaryType, relation_id: this.relationId }).subscribe(result => {
      if (result.status_code === 200) { // @todo 分页加载问题
        this.markList = result['data']['detail'];
      } else {
        this.markList = [];
      }
    }, error => {
      this.markList = [];
      this._message.error('书签加载失败');
    });
  }


  createBookMark() {
    this.create.emit();
  }
  saveBookMark(item) {
    this.save.emit(item);
  }


  changeSelectedBookMark(bookMark) {
    const bookMarkInfo = this.bookMarkService.getBookMark(bookMark.bookmark_id).subscribe(result => {
      if (result['status_code'] && result['status_code'] === 200) {
        this.activeBookMarkId = bookMark.bookmark_id;
        this.selected.emit(result['data']['sheets_setting']);
      } else {
        this._message.error('书签信息失败,请重试');
      }
    }, error => {
      this._message.error('书签信息失败,请重试');
    });

  }


  delBookMark(row, index) {
    this.bookMarkService.deleteBookMark({ bookmark_id: row.bookmark_id }).subscribe(
      data => {
        if (data.status_code === 200) {
          this._message.success('删除书签页成功');
          this.markList.splice(index, 1);
        } else {
          this._message.error('删除书签页失败');
        }
      },
      (err) => {
        this._message.error('删除书签页失败');
      }
    );
  }

  resetActiveMark() {
    this.activeBookMarkId = 0;
  }

  ngOnDestroy(): void {
    if (this.list$ instanceof Subscriber) {
      this.list$.unsubscribe();
    }

  }




}
