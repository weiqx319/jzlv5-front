import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appToggleRegion]'
})
export class ToggleRegionDirective {

  getStyle(obj, attr) {
    // IE
    if (obj.currentStyle) {
      return obj.currentStyle[attr];
    } else {
      // Firefox
      return getComputedStyle(obj, null)[attr];
    }
  }

  constructor(private el: ElementRef) { }
  @HostListener('click', ['$event']) onClick(e) {
    const region_content_dom = this.el.nativeElement.parentNode.querySelector('div.region-content');
    region_content_dom.style.top = this.el.nativeElement.getBoundingClientRect().bottom + 'px';
    region_content_dom.style.left = this.el.nativeElement.getBoundingClientRect().left + 'px';
    if (this.getStyle(region_content_dom, 'display') === 'block') {
      region_content_dom.style.display = 'none';
      region_content_dom.style.position = 'static';
      this.el.nativeElement.style.borderBottom = '1px solid #e4e4e4';
    } else {
      region_content_dom.style.display = 'block';
      region_content_dom.style.position = 'fixed';
      this.el.nativeElement.style.borderBottom = 'none';
    }
  }
}
