import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-monitor-chart',
  templateUrl: './monitor-chart.component.html',
  styleUrls: ['./monitor-chart.component.scss']
})
export class MonitorChartComponent implements OnInit {

  @Input() options: any;
  constructor() { }

  ngOnInit() {
  }

}
