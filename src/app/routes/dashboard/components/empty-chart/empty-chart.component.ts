import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-empty-chart',
  templateUrl: './empty-chart.component.html',
  styleUrls: ['./empty-chart.component.scss']
})
export class EmptyChartComponent implements OnInit {
  private _size: number;
  @Input() set size(size: number) {
    this._size = size;
  }

  constructor() { }

  ngOnInit() {
  }


}
