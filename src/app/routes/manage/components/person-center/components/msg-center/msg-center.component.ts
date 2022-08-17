import {Component, HostListener, OnInit} from '@angular/core';
import {ManageService} from "../../../../service/manage.service";
import {ManageItemService} from "../../../../service/manage-item.service";

@Component({
  selector: 'app-msg-center',
  templateUrl: './msg-center.component.html',
  styleUrls: ['./msg-center.component.scss'],
})
export class MsgCenterComponent implements OnInit {
  constructor(private manageService: ManageService) {
  }

  ngOnInit() {
  }
}
