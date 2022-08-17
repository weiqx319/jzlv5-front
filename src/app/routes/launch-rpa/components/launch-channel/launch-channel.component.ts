import {Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from "../../../../core/service/auth.service";
import {MenuService} from "../../../../core/service/menu.service";


@Component({
  selector: 'app-launch-channel',
  templateUrl: './launch-channel.component.html',
  styleUrls: ['./launch-channel.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LaunchChannelComponent implements OnInit {

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
