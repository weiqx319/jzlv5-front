import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {HelpCenterService} from "../../service/help-center.service";

@Component({
  selector: 'app-question-feedback',
  templateUrl: './question-feedback.component.html',
  styleUrls: ['./question-feedback.component.scss']
})
export class QuestionFeedbackComponent implements OnInit {

  public feedback_content = '';
  constructor(private help: HelpCenterService,
              private subject: NzModalRef,
              private message: NzMessageService) { }

  ngOnInit() {
  }

  cancel() {
    this.subject.destroy('onCancel');
  }
  doSave() {
    if (!this.feedback_content) {
      this.message.error('反馈内容不能为空，请完善！');
      return false;
    }
    this.help.addFeedback({feedback_content: this.feedback_content}).subscribe((result) => {
      if (result['status_code'] === 200) {
        this.message.success('提交成功');
        this.subject.destroy('onOk');
      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error(result['message']);
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error(result['message']);
      } else if (result['status_code'] && result.status_code === 205) {
      } else {
        this.message.error(result.message);
      }
    });

  }
}
