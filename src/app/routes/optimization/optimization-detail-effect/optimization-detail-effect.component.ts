import { Component, OnInit } from '@angular/core';
import {OptimizationService} from "../service/optimization.service";
import {ActivatedRoute, Router} from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import {OptimizationDetailEffectService} from "./service/optimization-detail-effect.service";
import {OptimizationItemService} from "../service/optimization-item.service";
import {AuthService} from "../../../core/service/auth.service";

@Component({
  selector: 'app-optimization-detail-effect',
  templateUrl: './optimization-detail-effect.component.html',
  styleUrls: ['./optimization-detail-effect.component.scss'],
  providers: [ OptimizationDetailEffectService, OptimizationItemService, OptimizationService ]
})
export class OptimizationDetailEffectComponent implements OnInit {


  public activeType = 'list';
  public optimizationTab = [
    {'name': '计划', key: 'list'},
    {'name': '关键词', key: 'kwd_list'},
  /*  {'name': '竞价日志', key: 'log'},*/
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
      } else {

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
