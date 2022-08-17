import { Component, OnInit } from '@angular/core';
import {HelpCenterService} from "../../service/help-center.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  public catId: any;
  constructor(private help: HelpCenterService,
              private  route: ActivatedRoute) {
    this.catId =  this.route.snapshot.paramMap.get('id');

  }
  public info: any;

  ngOnInit() {
    this.getArticleDetail();
  }

  getArticleDetail() {
    this.help.getArticleDetail(this.catId).subscribe((result) => {
      if (result['status_code'] === 200) {
        this.info = result['data'];
        this.help.setArticleName(this.info.post_title);
        this.help.setCatId(this.info.term_taxonomy_id);
      }
    });
  }


  goBack() {
    history.go(-1);
    this.help.setArticleName('');
  }

}
