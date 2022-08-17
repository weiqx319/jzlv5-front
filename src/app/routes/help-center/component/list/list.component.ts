import {Component, OnInit} from '@angular/core';
import {HelpCenterService} from "../../service/help-center.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  constructor(private help: HelpCenterService,
              private router: Router,
              private  route: ActivatedRoute) {
    this.catId =  this.route.snapshot.paramMap.get('id');
  }


  pageIndex = 1;
  pageSize = 20;
  total = 1;
  loading = true;

  public contentList = [];
  public catId: any;
  ngOnInit() {
    this.help.setCatId(this.catId);
    this.getArticleList(this.catId);
    this.help.getListId().subscribe((result) => {
      this.getArticleList(result);
    });
  }

  getArticleList(id) {
    this.help.getArticleList(id, { page: this.pageIndex, count: this.pageSize }).subscribe((result) => {
      if (result['status_code'] === 200) {
        this.contentList = result['data']['detail'];
        this.total = result['data']['detail_count'];
        this.loading = false;
      }
    });
  }

  clickList(value, name) {
    this.help.setArticleName(name);
    this.router.navigateByUrl('/help/detail/' + value);
  }

  searchData() {

    this.getArticleList(this.catId);
  }

}
