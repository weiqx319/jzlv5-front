import {Component, HostListener, OnInit} from '@angular/core';
import {MenuService} from "../../../../core/service/menu.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../core/service/auth.service";

@Component({
  selector: 'app-laubch-group-new',
  templateUrl: './launch-group-new.component.html',
  styleUrls: ['./launch-group-new.component.scss']
})
export class LaunchGroupNewComponent implements OnInit {

  public noResultHeight = document.body.clientHeight - 187 - 40 - 40;
  public publisherId;
  public cid;


  constructor(private menuService: MenuService,
              private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,) {

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.publisherId = this.menuService.currentPublisherId;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 187 - 40 - 40;
  }

  ngOnInit() {

  }

}
