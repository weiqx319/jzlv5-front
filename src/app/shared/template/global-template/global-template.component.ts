import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-global-template',
  templateUrl: './global-template.component.html',
  styleUrls: ['./global-template.component.scss']
})
export class GlobalTemplateComponent implements OnInit {

  @ViewChild('tagPlaceHolder', { static: true }) tagPlaceHolder: TemplateRef<any>;
  @ViewChild('totalItemTemplate', { static: true }) totalItemTemplate: TemplateRef<any>;
  @ViewChild('noResultTd', { static: true }) noResultTd: TemplateRef<any>;

  constructor() { }

  ngOnInit() {
  }

}
