import { Injectable, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable, of, Subject, timer } from "rxjs";
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { NzNotificationData, NzNotificationService } from 'ng-zorro-antd/notification';
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { HttpClientService } from "../../core/service/http.client";
import { switchMap, takeWhile, tap } from "rxjs/operators";
import { AuthService } from "../../core/service/auth.service";
import {MenuService} from "../../core/service/menu.service";

interface NotifyData {
  type: string;
  data: any[];
}

@Injectable()
export class NotifyService {

  private opTypeRelation: any = {
    account: '批量编辑账户',
    campaign: '批量编辑计划',
    adgroup: '批量编辑单元',
    keyword: '批量编辑关键词',
    del_keyword: '删除关键词',
    del_creative: '删除创意',
    creative: '批量编辑创意',
    dim: '批量编辑维度',
    optimization_group: '批量编辑优化组',
    optimization_detail_ranking: '优化组导入关键词',
    upload_account: "批量上传帐户",
    upload_keyword: "批量上传关键词",
    upload_creative: "批量上传创意",
    upload_adgroup: "批量上传单元",
    upload_campaign: "批量上传计划",
    import_folder_keyword: "导入关键词分组",
    import_folder_adgroup: "导入关键词单元",
    import_folder_campaign: "导入关键词计划",
    campaign_add: '添加单个计划',
    adgroup_add: '添加单个单元',
    keyword_add: '添加单个关键词',
    creative_add: '添加单个创意',
    upload_generator: '上传跟踪项',
    sync_creative: '同步创意',

    sync_material_title: '同步标题',
    sync_material_video: '同步视频',
    sync_material_image: '同步图片',
    sync_material_convert: '同步渠道号',
    sync_material_audience: '同步媒体人群包',
  };

  private initListFlag = false;

  private initMaterialJobFlag = false;

  public accountPendingData: any[] = [];
  public accountInitPendingData: any[] = [];
  public reportStatusPendingData: any[] = [];
  public batchUpdateJobPengdingData: any[] = [];
  public materialJobPengdingData: any[] = [];

  public accountNotifyId: NzNotificationData;
  public accountInitNotifyId: NzNotificationData;
  public reportStatusNotifyId: NzNotificationData;
  public batchUpdateJobNotifyId: NzNotificationData;
  public materialJobJobNotifyId: NzNotificationData;

  public accountRefresh$ = new Subject();
  public accountRefreshFlag = false;

  public accountInitRefresh$ = new Subject();
  public accountInitRefreshFlag = false;

  public reportStatusRefresh$ = new Subject();
  public reportStatusRefreshFlag = false;

  public batchUpdateJobRefresh$ = new Subject();
  public batchUpdateJobRefreshFlag = false;

  public materialJobRefresh$ = new Subject();
  public materialJobRefreshFlag = false;

  public notifyData = new Subject<NotifyData>();

  public publisherId=0;

  constructor(private nzConfigService: NzConfigService, private notification: NzNotificationService, private _httpClient: HttpClientService, private authService: AuthService, private menuService: MenuService) {
    this.nzConfigService.set('notification', {
      nzPlacement: 'bottomRight',
      nzMaxStack: 500,
    });
    this.accountRefresh$.subscribe((result) => {
      if (result === 'start' && !this.accountRefreshFlag && this.accountPendingData.length > 0) {
        this.accountRefreshFlag = true;
        const refreshData = this.accountPendingData[0];
        this.accountNotifyId = this.notification.create('info', '账户同步',
          refreshData['pub_account_name'] + ' 同步中...', { nzDuration: 0 });
        this.refreshAccountSyncStatus(refreshData);
      }
    });
    this.accountInitRefresh$.subscribe((result) => {
      if (result === 'start' && !this.accountInitRefreshFlag && this.accountInitPendingData.length > 0) {
        this.accountInitRefreshFlag = true;
        const refreshData = this.accountInitPendingData[0];
        this.accountInitNotifyId = this.notification.create('info', '数据同步',
          refreshData['pub_account_name'] + ' 同步中...', { nzDuration: 0 });
        this.refreshAccountInitStatus(refreshData);
      }
    });
    this.reportStatusRefresh$.subscribe((result) => {
      if (result === 'start' && !this.reportStatusRefreshFlag && this.reportStatusPendingData.length > 0) {
        this.reportStatusRefreshFlag = true;
        const refreshData = this.reportStatusPendingData[0];
        this.refreshReportStatus(refreshData);
      }
    });

    this.batchUpdateJobRefresh$.subscribe((result) => {
      if (result === 'start' && !this.batchUpdateJobRefreshFlag && this.batchUpdateJobPengdingData.length > 0) {
        this.batchUpdateJobRefreshFlag = true;
        const refreshData = this.batchUpdateJobPengdingData[0];
        this.refreshBatchJobStatus(refreshData);
      }
    });


    this.materialJobRefresh$.subscribe((result) => {
      if (result === 'start' && !this.materialJobRefreshFlag && this.materialJobPengdingData.length > 0) {
        this.materialJobRefreshFlag = true;
        const refreshData = this.materialJobPengdingData[0];
        this.refreshMaterialJobStatus(refreshData);
      }
    });

    this.notifyData.subscribe((data: NotifyData) => {
      if (data.type === 'material_sync_job') {

        data.data.forEach(item => {
          const findJobData = this.materialJobPengdingData.find((pendingItem) => pendingItem['job_id'] === item['job_id']);
          if (isUndefined(findJobData)) {
            this.materialJobPengdingData.push(item);
          }
        });
        if (this.materialJobPengdingData.length > 0) {
          // console.log(this.accountPendingData);
          this.materialJobRefresh$.next('start');

        }
      } else if (data.type === 'account') {

        data.data.forEach(item => {
          const findChanPubId = this.accountPendingData.find((pendingItem) => pendingItem['chan_pub_id'] === item['chan_pub_id']);
          if (isUndefined(findChanPubId)) {
            this.accountPendingData.push({
              chan_pub_id: item['chan_pub_id'],
              cid: item['cid'],
              uid: item['uid'],
              pub_account_name: item['pub_account_name'],
              advert_name: item['advert_name'],
            });
          }
        });
        if (this.accountPendingData.length > 0) {
          // console.log(this.accountPendingData);
          this.accountRefresh$.next('start');

        }
      } else if (data.type === 'account_init') {

        data.data.forEach(item => {
          const findChanPubId = this.accountInitPendingData.find((pendingItem) => pendingItem['chan_pub_id'] === item['chan_pub_id']);
          if (isUndefined(findChanPubId)) {
            this.accountInitPendingData.push({
              chan_pub_id: item['chan_pub_id'],
              cid: item['cid'],
              uid: item['uid'],
              pub_account_name: item['pub_account_name'],
              advert_name: item['advert_name'],
            });
          }
        });
        if (this.accountInitPendingData.length > 0) {
          // console.log(this.accountPendingData);
          this.accountInitRefresh$.next('start');

        }
      } else if (data.type === 'report') {

        data.data.forEach(item => {
          const findChanPubId = this.reportStatusPendingData.find((pendingItem) => pendingItem['report_id'] === item['report_id'] && pendingItem['job_id'] === item['job_id']);
          if (isUndefined(findChanPubId)) {
            this.reportStatusPendingData.push({
              report_id: item['report_id'],
              job_id: item['job_id'],
              cid: item['cid'],
              uid: item['uid'],
              report_name: item['report_name']
            });
          }
        });
        if (this.reportStatusPendingData.length > 0) {
          // console.log(this.accountPendingData);
          this.reportStatusRefresh$.next('start');

        }
      } else if (data.type === 'batch_update_job') {

        data.data.forEach(item => {
          const findChanPubId = this.batchUpdateJobPengdingData.find((pendingItem) => pendingItem['job_id'] === item['job_id']);
          if (isUndefined(findChanPubId)) {
            this.batchUpdateJobPengdingData.push({
              job_id: item['job_id'],
              cid: item['cid'],
              uid: item['uid'],
              op_type: item['op_type']
            });
          }
        });
        if (this.batchUpdateJobPengdingData.length > 0) {
          // console.log(this.accountPendingData);
          this.batchUpdateJobRefresh$.next('start');

        }
      }

    });

    this.initMaterialPending();

  }

  public refreshAccountSyncStatus(refreshData) {
    const accountChannelPublisher = {
      channel_1: '搜索',
      channel_2: '信息流',
      channel_3: '应用市场',
      channel_7: '电商',
    };
    const chanPubId = refreshData['chan_pub_id'];
    const userId = refreshData['uid'];
    let currentRefreshFlag = true;
    let currentStep = "";
    let messageRemove = false;
    const statusCheckCount = {
      status_0: 0,
      status_9: 0,
      status_1: 0,
      status_2: 0, // 写库失败
      status_4: 0 // 成功，推api失败
    };

    timer(0, 10000)
      .pipe(
        switchMap(() => {
          return this.getAccountInfo(chanPubId, { user_id: userId }).pipe(
            switchMap((data) => {
              if (data['status_code'] === 200 && (data['data']['sync_status'] === 0 || data['data']['sync_status'] === 4)) {
                const channelName = accountChannelPublisher['channel_' + data['data']['channel_id']];
                if (!isUndefined(this.accountNotifyId)) {
                  this.notification.remove(this.accountNotifyId.messageId);
                }
                if (data['data']['account_status'] === -1) {
                  this.notification.create('error', '账户无效[' + channelName + ']',
                    '账户:' + data['data']['pub_account_name'] + '无效,请处理', { nzDuration: 5000 });
                } else {
                  this.notification.create('success', '账户同步[' + channelName + ']',
                    '账户:' + data['data']['pub_account_name'] + '同步成功.', { nzDuration: 2500 });
                }

                this.accountPendingData.shift();
                this.accountRefreshFlag = false;
                currentRefreshFlag = false;
                this.accountRefresh$.next('start');
              } else if (data['status_code'] === 200 && data['data']['sync_status'] === 2) {
                const channelName = accountChannelPublisher['channel_' + data['data']['channel_id']];
                if (!isUndefined(this.accountNotifyId)) {
                  this.notification.remove(this.accountNotifyId.messageId);
                }
                this.notification.create('error', '账户同步[' + channelName + ']',
                  '账户:' + data['data']['pub_account_name'] + '同步失败.', { nzDuration: 10000 });

                this.accountPendingData.shift();
                this.accountRefreshFlag = false;
                currentRefreshFlag = false;
                this.accountRefresh$.next('start');

              } else if (data['status_code'] === 200 && data['data']['sync_status'] === 9) {
                const channelName = accountChannelPublisher['channel_' + data['data']['channel_id']];
                if (statusCheckCount.status_1 === 0) {
                  if (!isUndefined(this.accountNotifyId) && currentStep !== 'pending') {
                    this.notification.remove(this.accountNotifyId.messageId);
                    messageRemove = true;
                  }
                  if (isUndefined(this.accountNotifyId) || this.accountNotifyId.state === 'leave' || messageRemove) {
                    this.accountNotifyId = this.notification.create('info', '账户同步[' + channelName + ']',
                      '账户:' + data['data']['pub_account_name'] + ' 排队中,请耐心等待.', { nzDuration: 0 });
                    messageRemove = false;
                  }
                }
                statusCheckCount.status_9++;
                currentStep = 'pending';

              } else if (data['status_code'] === 200) {
                const channelName = accountChannelPublisher['channel_' + data['data']['channel_id']];
                if (statusCheckCount.status_1 === 0) {
                  if (!isUndefined(this.accountNotifyId) && currentStep !== 'syncing') {
                    this.notification.remove(this.accountNotifyId.messageId);
                    messageRemove = true;
                  }
                  if (isUndefined(this.accountNotifyId) || this.accountNotifyId.state === 'leave' || messageRemove) {
                    this.accountNotifyId = this.notification.create('info', '账户同步[' + channelName + ']',
                      '账户:' + data['data']['pub_account_name'] + ' 同步中....', { nzDuration: 0 });
                    messageRemove = false;
                  }
                }

                statusCheckCount.status_1++;

                currentStep = 'syncing';

              }
              // this.accountRefreshFlag = false;
              return of(true);
            })
          );
        }),
        takeWhile(() => currentRefreshFlag)
      ).subscribe();

  }

  public refreshAccountInitStatus(refreshData) {
    const accountChannelPublisher = {
      channel_1: 'sem',
      channel_2: 'feed',
      channel_3: '应用市场',
      channel_7: '电商',
    };
    const chanPubId = refreshData['chan_pub_id'];
    const userId = refreshData['uid'];
    let currentRefreshFlag = true;
    const statusCheckCount = {
      status_3: 0,
      status_4: 0,
      status_2: 0
    };
    timer(0, 10000)
      .pipe(
        switchMap(() => {
          return this.getAccountInfo(chanPubId, { user_id: userId }).pipe(
            switchMap((data) => {
              if (data['status_code'] === 200 && data['data']['init_data_status'] === 3) {
                const channelName = accountChannelPublisher['channel_' + data['data']['channel_id']];
                if (!isUndefined(this.accountInitNotifyId)) {
                  this.notification.remove(this.accountInitNotifyId.messageId);
                }
                this.notification.create('success', '数据同步[' + channelName + ']',
                  '账户:' + data['data']['pub_account_name'] + ' 数据同步成功.', { nzDuration: 2500 });
                this.accountInitPendingData.shift();
                this.accountInitRefreshFlag = false;
                currentRefreshFlag = false;
                this.accountInitRefresh$.next('start');
              } else if (data['status_code'] === 200 && data['data']['init_data_status'] === 4) {
                const channelName = accountChannelPublisher['channel_' + data['data']['channel_id']];
                if (!isUndefined(this.accountInitNotifyId)) {
                  this.notification.remove(this.accountInitNotifyId.messageId);
                }
                this.accountInitNotifyId = this.notification.create('error', '数据同步[' + channelName + ']',
                  '账户:' + data['data']['pub_account_name'] + ' 数据同步失败，请联系客服.', { nzDuration: 10000 });
                this.accountInitPendingData.shift();
                this.accountInitRefreshFlag = false;
                currentRefreshFlag = false;
                this.accountInitRefresh$.next('start');
              } else if (data['status_code'] === 200 && data['data']['init_data_status'] === 2) {
                const channelName = accountChannelPublisher['channel_' + data['data']['channel_id']];
                if (statusCheckCount.status_2 === 0) {
                  if (isUndefined(this.accountInitNotifyId) || this.accountInitNotifyId.state === 'leave') {
                    this.accountInitNotifyId = this.notification.create('info', '数据同步[' + channelName + ']',
                      '账户:' + data['data']['pub_account_name'] + ' 数据同步中....', { nzDuration: 0 });
                  }
                }
                statusCheckCount.status_2++;

              }
              // this.accountRefreshFlag = false;
              return of(true);
            })
          );
        }),
        takeWhile(() => currentRefreshFlag)
      ).subscribe();
  }

  public refreshReportStatus(refreshData) {
    const reportId = refreshData['report_id'];
    const jobId = refreshData['job_id'];
    const userId = refreshData['uid'];
    const cid = refreshData['cid'];
    const reportName = refreshData['report_name'];
    let currentRefreshFlag = true;
    const statusCheckCount = {
      status_0: 0,
      status_1: 0,
      status_2: 0,
      status_3: 0,
    };
    timer(0, 10000)
      .pipe(
        switchMap(() => {
          return this.getReportStatus(reportId, jobId, { user_id: userId, cid }).pipe(
            switchMap((data) => {
              if (data['status_code'] === 200 && data['data']['status'] === 2) {
                if (!isUndefined(this.reportStatusNotifyId)) {
                  this.notification.remove(this.reportStatusNotifyId.messageId);
                }
                this.notification.create('success', '报表生成',
                  '报表:' + reportName + ' 生成成功,请前往查看', { nzDuration: 2500 });
                this.reportStatusPendingData.shift();
                this.reportStatusRefreshFlag = false;
                currentRefreshFlag = false;
                this.reportStatusRefresh$.next('start');
              } else if (data['status_code'] === 200 && data['data']['status'] === 3) {
                if (!isUndefined(this.reportStatusNotifyId)) {
                  this.notification.remove(this.reportStatusNotifyId.messageId);
                }
                this.reportStatusNotifyId = this.notification.create('error', '报表生成',
                  '报表:' + reportName + ' 生成失败，请联系客服.', { nzDuration: 10000 });
                this.reportStatusPendingData.shift();
                this.reportStatusRefreshFlag = false;
                currentRefreshFlag = false;
                this.reportStatusRefresh$.next('start');
              } else if (data['status_code'] === 200 && data['data']['status'] === 1) {
                if (statusCheckCount.status_1 === 0) {
                  if (!isUndefined(this.reportStatusNotifyId)) {
                    this.notification.remove(this.reportStatusNotifyId.messageId);
                  }
                  this.reportStatusNotifyId = this.notification.create('info', '报表生成',
                    '报表:' + reportName + ' 生成中', { nzDuration: 0 });
                }
                statusCheckCount.status_1++;
              } else if (data['status_code'] === 200 && data['data']['status'] === 0) {
                if (statusCheckCount.status_0 === 0) {
                  if (!isUndefined(this.reportStatusNotifyId)) {
                    this.notification.remove(this.reportStatusNotifyId.messageId);
                  }
                  this.reportStatusNotifyId = this.notification.create('info', '报表生成',
                    '报表:' + reportName + ' 准备生成', { nzDuration: 0 });
                }
                statusCheckCount.status_0++;

              }
              // this.accountRefreshFlag = false;
              return of(true);
            })
          );
        }),
        takeWhile(() => currentRefreshFlag)
      ).subscribe();
  }

  public refreshMaterialJobStatus(refreshData) {
    const jobId = refreshData['job_id'];
    const opType = 'sync_material_' + refreshData['material_type'];
    const opName = this.opTypeRelation.hasOwnProperty(opType) ? this.opTypeRelation[opType] : '';
    let currentRefreshFlag = true;
    const statusCheckCount = {
      status_0: 0,
      status_1: 0,
      status_2: 0,
      status_3: 0,
      status_4: 0,
    };
    timer(0, 5000)
      .pipe(
        switchMap(() => {
          return this.getMaterialJobStatus(jobId).pipe(
            switchMap((data) => {
              if (data['status_code'] === 200 && data['data']['task_status'] == 3) {
                if (!isUndefined(this.materialJobJobNotifyId)) {
                  this.notification.remove(this.materialJobJobNotifyId.messageId);
                }
                this.notification.create('success', '' + opName + '成功',
                  data['data']['task_result'], { nzDuration: 5000 });
                this.materialJobPengdingData.shift();
                this.materialJobRefreshFlag = false;
                currentRefreshFlag = false;
                this.materialJobRefresh$.next('start');
              } else if (data['status_code'] === 200 && data['data']['task_status'] == 2) {
                if (!isUndefined(this.materialJobJobNotifyId)) {
                  this.notification.remove(this.materialJobJobNotifyId.messageId);
                }
                this.notification.create('success', '' + opName + '部分成功',
                  data['data']['task_result'], { nzDuration: 5000 });
                this.materialJobPengdingData.shift();
                this.materialJobRefreshFlag = false;
                currentRefreshFlag = false;
                this.materialJobRefresh$.next('start');
              } else if (data['status_code'] === 200 && data['data']['task_status'] == 4) {
                if (!isUndefined(this.materialJobJobNotifyId)) {
                  this.notification.remove(this.materialJobJobNotifyId.messageId);
                }
                this.materialJobJobNotifyId = this.notification.create('error', '' + opName + '失败',
                  data['data']['task_result'], { nzDuration: 10000 });
                this.materialJobPengdingData.shift();
                this.materialJobRefreshFlag = false;
                currentRefreshFlag = false;
                this.materialJobRefresh$.next('start');
              } else if (data['status_code'] === 200 && data['data']['task_status'] <= 1) {
                if (statusCheckCount.status_1 === 0) {
                  if (!isUndefined(this.materialJobJobNotifyId)) {
                    this.notification.remove(this.materialJobJobNotifyId.messageId);
                  }

                  const showMessage = data['data']['task_result'] != '' ? data['data']['task_result'] : '进行中';
                  this.materialJobJobNotifyId = this.notification.create('info', '' + opName,
                    showMessage, { nzDuration: 0 });
                }
                statusCheckCount.status_1++;
              } else {
                if (!isUndefined(this.materialJobJobNotifyId)) {
                  this.notification.remove(this.materialJobJobNotifyId.messageId);
                }
                this.materialJobPengdingData.shift();
                this.materialJobRefreshFlag = false;
                currentRefreshFlag = false;
                this.materialJobRefresh$.next('start');

              }
              // this.accountRefreshFlag = false;
              return of(true);
            }),
          );
        }),
        takeWhile(() => currentRefreshFlag)
      ).subscribe();
  }


  public refreshBatchJobStatus(refreshData) {
    const jobId = refreshData['job_id'];
    const userId = refreshData['uid'];
    const cid = refreshData['cid'];
    const opType = refreshData['op_type'];
    this.publisherId = this.menuService.currentPublisherId;
    if (this.publisherId==6) {
      this.opTypeRelation.campaign='批量编辑推广计划';
      this.opTypeRelation.adgroup='批量编辑广告';
    } else if (this.publisherId==7) {
      this.opTypeRelation.campaign='批量编辑广告组';
      this.opTypeRelation.adgroup='批量编辑计划';
    }
    const opName = this.opTypeRelation.hasOwnProperty(opType) ? this.opTypeRelation[opType] : '';
    let currentRefreshFlag = true;
    const statusCheckCount = {
      status_0: 0,
      status_1: 0,
      status_2: 0,
      status_3: 0,
      status_4: 0,
    };
    timer(0, 5000)
      .pipe(
        switchMap(() => {
          return this.getJobStatus(jobId, opType, { user_id: userId, cid }).pipe(
            switchMap((data) => {
              if (data['status_code'] === 200 && data['data']['status'] === 3) {
                if (!isUndefined(this.batchUpdateJobNotifyId)) {
                  this.notification.remove(this.batchUpdateJobNotifyId.messageId);
                }
                this.notification.create('success', '' + opName + '成功',
                  data['data']['message'], { nzDuration: 5000 });
                this.batchUpdateJobPengdingData.shift();
                this.batchUpdateJobRefreshFlag = false;
                currentRefreshFlag = false;
                this.batchUpdateJobRefresh$.next('start');
              } else if (data['status_code'] === 200 && data['data']['status'] === 2) {
                if (!isUndefined(this.batchUpdateJobNotifyId)) {
                  this.notification.remove(this.batchUpdateJobNotifyId.messageId);
                }
                this.notification.create('success', '' + opName + '部分成功',
                  data['data']['message'], { nzDuration: 5000 });
                this.batchUpdateJobPengdingData.shift();
                this.batchUpdateJobRefreshFlag = false;
                currentRefreshFlag = false;
                this.batchUpdateJobRefresh$.next('start');
              } else if (data['status_code'] === 200 && data['data']['status'] === 4) {
                if (!isUndefined(this.batchUpdateJobNotifyId)) {
                  this.notification.remove(this.batchUpdateJobNotifyId.messageId);
                }
                this.batchUpdateJobNotifyId = this.notification.create('error', '' + opName + '失败',
                  data['data']['message'], { nzDuration: 10000 });
                this.batchUpdateJobPengdingData.shift();
                this.batchUpdateJobRefreshFlag = false;
                currentRefreshFlag = false;
                this.batchUpdateJobRefresh$.next('start');
              } else if (data['status_code'] === 200 && data['data']['status'] <= 1) {
                if (statusCheckCount.status_1 === 0) {
                  if (!isUndefined(this.batchUpdateJobNotifyId)) {
                    this.notification.remove(this.batchUpdateJobNotifyId.messageId);
                  }

                  const showMessage = data['data']['message'] != '' ? data['data']['message'] : '进行中';
                  this.batchUpdateJobNotifyId = this.notification.create('info', '' + opName,
                    showMessage, { nzDuration: 0 });
                }
                statusCheckCount.status_1++;
              } else {
                if (!isUndefined(this.batchUpdateJobNotifyId)) {
                  this.notification.remove(this.batchUpdateJobNotifyId.messageId);
                }
                this.batchUpdateJobPengdingData.shift();
                this.batchUpdateJobRefreshFlag = false;
                currentRefreshFlag = false;
                this.batchUpdateJobRefresh$.next('start');

              }
              // this.accountRefreshFlag = false;
              return of(true);
            }),
          );
        }),
        takeWhile(() => currentRefreshFlag)
      ).subscribe();
  }

  initListAccountPending() {
    if (this.initListFlag) {
      return;
    }
    this.initListFlag = true;
    const currentOper = this.authService.getCurrentUserOperdInfo();
    const notifyData = [];
    const notifyInitData = [];
    const notEffectAccountList = [];
    if (!isUndefined(currentOper.select_uid) && currentOper.select_uid > 0) {
      this.getAccountList({}, { page: 1, count: 100000, user_id: currentOper.select_uid }).subscribe(result => {
        if (result['status_code'] && result['status_code'] === 200 && result['data']['detail_count'] > 0) {
          result['data']['detail'].forEach(item => {

            if (item['pub_account_id'] <= -1) {
              return;
            }
            if (item['account_status'] === -1) {
              notEffectAccountList.push(item);
              return;
            }

            const item_time = item['sync_time'].split(' ')[0];
            const current_time = this.getNowTime();

            if (item['sync_status'] === 2 && item['account_status'] === 0 && current_time !== item_time) {

            } else if ((item['sync_status'] > 0 && item['sync_status'] !== 4) || item['account_status'] === -1) {
              notifyData.push({ chan_pub_id: item.chan_pub_id, cid: item.cid, uid: currentOper.select_uid, advertiser_name: item['advertiser_name'], pub_account_name: item['pub_account_name'], sync_status: item['sync_status'], account_status: item['account_status'] });
            }
            if (notifyData.length > 0) {
              this.notifyData.next({ type: 'account', data: notifyData });
            }
            if (item['init_data_status'] === 2 || item['init_data_status'] === 4) {
              notifyInitData.push({ chan_pub_id: item.chan_pub_id, cid: item.cid, uid: currentOper.select_uid, advertiser_name: item['advertiser_name'], pub_account_name: item['pub_account_name'], init_status: item['init_data_status'] });
            }
            if (notifyInitData.length > 0) {
              this.notifyData.next({ type: 'account_init', data: notifyInitData });
            }

          });

          if (notEffectAccountList.length > 0) {
            this.notification.create('error', '账户无效提示',
              '账户无效' + notEffectAccountList.length + '个，请重新编辑密码授权<br/> <a target="_blank" href="/manage/account/account_binding?account_status=-1"">点击查看</a>', { nzDuration: 30000 });

          }

        }
      });
    }
  }


  initMaterialPending() {
    // this._vcr.createEmbeddedView();

    if (this.initMaterialJobFlag) {
      return;
    }
    this.initMaterialJobFlag = true;
    const notifyData = [];
    this.getMaterialJobList().subscribe(result => {
      if (result['status_code'] && result['status_code'] === 200 && result['data'].length > 0) {
        result['data'].forEach(item => {
          notifyData.push({ job_id: item['task_id'], material_type: item['materiel_type'] });
        });

        if (notifyData.length > 0) {
          this.notifyData.next({ type: 'material_sync_job', data: notifyData });
        }

      }
    });



  }


  getNowTime() {
    const day = new Date();
    let formatDate = '';
    formatDate = day.getFullYear() + "-" + this.formatTen((day.getMonth() + 1)) + "-" + this.formatTen(day.getDate());
    return formatDate;
  }
  private formatTen(num) {
    return num > 9 ? (num + "") : ("0" + num);
  }

  getAccountInfo(chanPubId, params?): Observable<any> {
    const url = '/manager_base/publish_account/' + chanPubId;
    return this._httpClient.get(url, params);
  }

  // -- advertiser account oper
  getAccountList(body, params?): Observable<any> {
    const url = '/manager_base/publish_account/get_list';
    return this._httpClient.post(url, body, params);

  }

  getReportStatus(reportId, jobId, params?): Observable<any> {
    const url = '/custom_report/' + reportId + '/job/show/' + jobId;
    return this._httpClient.get(url, params);
  }

  getJobStatus(jobId, opType, params?): Observable<any> {
    let url = '';
    if (opType == 'optimization_detail_ranking' || opType == 'optimization_group' || opType.indexOf('import_folder') === 0) {
      url = '/job/' + jobId + '/job_status';
    } else {
      url = '/job/' + jobId + '/job_task_status';
    }
    return this._httpClient.get(url, params);

  }

  getMaterialJobStatus(jobId, params?): Observable<any> {
    const url = '/launch_rpa/task/' + jobId + '/task_status';
    return this._httpClient.get(url, params);
  }


  getMaterialJobList(params?) {
    const url = '/launch_rpa/task/task_status_list';
    return this._httpClient.get(url, params);
  }


  // maintenanceNotify(){
  //   this.notification.create('success', '维护通知',
  //    "尊敬的用户您好：<br/>" +
  //     "九枝兰机房网络设备将于1月19日晚18：30-21：00进行停服维护，届时系统将不能登陆使用。由于系统维护给您带来不便，敬请谅解", {nzDuration: 0});
  // }

}
