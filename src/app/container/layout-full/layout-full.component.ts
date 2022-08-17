import { Component, ElementRef, HostListener, OnInit, ViewChild, Renderer2, ViewEncapsulation } from '@angular/core';
import { AuthService } from "../../core/service/auth.service";
import { FullscreenService } from "../../core/service/fullscreen.service";

@Component({
  selector: 'app-layout-full',
  templateUrl: './layout-full.component.html',
  styleUrls: ['./layout-full.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutFullComponent implements OnInit {
  private count = 0;
  private offsetHeight: any;
  @ViewChild('modelContent', { static: true }) modelContent: ElementRef;

  public is_fullscreen = false;

  constructor(
    private auth: AuthService, private fullscreen: FullscreenService,) {
    fullscreen.changeFullscreen.subscribe((res) => {
      this.is_fullscreen = res;
    });
  }

  ngOnInit() {
    this.offsetHeight = this.modelContent.nativeElement.offsetHeight.toString();
    // this.auth.setDashboardContentHeight(this.offsetHeight);
    localStorage.setItem('offsetHeight', this.offsetHeight);
    this.auth.getIsScrollChangeSize().subscribe(item => {
      const scrollTop = this.modelContent.nativeElement.scrollTop;
      this.auth.setIsScroll({
        scrollTop: scrollTop,
        count: ++this.count
      });
    });
  }
  @HostListener('scroll', ['$event'])
  onScroll($event: Event): void {

    const scrollTop = this.modelContent.nativeElement.scrollTop;
    this.auth.setIsScroll({
      scrollTop: scrollTop,
      count: ++this.count
    });
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.offsetHeight = this.modelContent.nativeElement.offsetHeight.toString();
    localStorage.setItem('offsetHeight', this.offsetHeight);
    const scrollTop = this.modelContent.nativeElement.scrollTop;
    this.auth.setIsScroll({
      scrollTop: scrollTop,
      count: ++this.count
    });
  }
}
