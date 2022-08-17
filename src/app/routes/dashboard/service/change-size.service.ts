import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {LocalStorageService} from "ngx-webstorage";

@Injectable()
export class ChangeSizeService {

  private _size = 8;
  private colSize = new Subject<number>();

  colSizeObservable = this.colSize.asObservable();

  constructor(private localSt: LocalStorageService) {
    const dashBoardSize = this.localSt.retrieve('dashBoardSize');
    if (dashBoardSize != null) {
        this._size = dashBoardSize;
    }
  }

  changeSize(size = 8) {
    this._size = size;
    this.localSt.store('dashBoardSize', this._size);
    this.colSize.next(size);
  }

  getSize(): number {
    return this._size;
  }


}
