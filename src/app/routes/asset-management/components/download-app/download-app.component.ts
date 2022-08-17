import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-download-app',
  templateUrl: './download-app.component.html',
  styleUrls: ['./download-app.component.scss']
})
export class DownloadAppComponent implements OnInit {

  public sectionTabList = [
    { title: 'Android', url: '../download_app/android' },
    { title: 'IOS', url: '../download_app/ios' },
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
