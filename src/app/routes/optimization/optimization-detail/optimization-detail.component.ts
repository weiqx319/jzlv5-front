import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {OptimizationService} from "../service/optimization.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import {ActivatedRoute, Router} from "@angular/router";
import {OptimizationDetailRankingService} from "./service/optimization-detail-ranking.service";
import {OptimizationItemService} from "../service/optimization-item.service";
import {AuthService} from "../../../core/service/auth.service";

@Component({
  selector: 'app-optimization-detail',
  templateUrl: './optimization-detail.component.html',
  styleUrls: ['./optimization-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ OptimizationDetailRankingService, OptimizationItemService, OptimizationService]
})
export class OptimizationDetailComponent implements OnInit {


  public activeType = 'list';
  public optimizationTab = [
    {'name': '关键词', key: 'list'},
    {'name': '竞价日志', key: 'log'},
    {'name': '上传列表', key: 'uploadList'},
    {'name': '高级设置', key: 'setting'}
  ];

  public optimizationId = '';
  public optimizationGroupInfo = null;
  constructor(
    private optimizationService: OptimizationService,
    private _message: NzMessageService,
    private router: Router,
    private authService: AuthService,
    private  route: ActivatedRoute
  ) {
    this.optimizationId =  this.route.snapshot.paramMap.get('id');
  }

  changeActive(type) {
    if (this.activeType !== type) {
      this.activeType = type;
    }
  }


  ngOnInit() {
    this.optimizationService.getOptimizationRefresh().subscribe(
      (item) => {
        if (item) {
          this.getOptimizationGroup (item);
        }
      }
      );
    this.getOptimizationGroup (this.optimizationId);

  }
  getOptimizationGroup(optimizationId) {
    this.optimizationService.getOptimizationGroup(optimizationId).subscribe(result => {
      if (result['status_code'] === 200) {
        this.optimizationGroupInfo = result['data'];
        this.optimizationService.setOptimizationInfo(result['data']);
      }
    }, error => {

    });
  }

  backList() {
    localStorage.removeItem('edit_state');
    this.authService.setStopBackState('');
    this.router.navigate(['optimization/list']);
  }
}
