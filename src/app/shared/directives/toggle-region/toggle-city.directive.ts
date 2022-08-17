import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appToggleCity]'
})
export class ToggleCityDirective {

  constructor(private el: ElementRef) { }

  @HostListener('mouseenter', ['$event']) onMouseenter(e) {
    const region_content_dom = this.el.nativeElement.querySelector('.city-content');
    if (region_content_dom) {
      region_content_dom.style.top = this.el.nativeElement.getBoundingClientRect().bottom + 'px';
      region_content_dom.style.left = this.el.nativeElement.getBoundingClientRect().left + 'px';
      region_content_dom.classList.toggle('city-content-show');
      this.el.nativeElement.classList.toggle('add-border');
    }
  }
  @HostListener('mouseleave', ['$event']) onMouseleave(e) {
    const region_content_dom = this.el.nativeElement.querySelector('.city-content');
    if (region_content_dom) {
      region_content_dom.classList.toggle('city-content-show');
      this.el.nativeElement.classList.toggle('add-border');
    }
  }
}
