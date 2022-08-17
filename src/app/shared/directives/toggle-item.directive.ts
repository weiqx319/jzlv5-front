import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appToggleItem]'
})
export class ToggleItemDirective {

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
    const item_content_dom = this.el.nativeElement.parentNode.querySelector('div.item-content');
    item_content_dom.style.top = this.el.nativeElement.getBoundingClientRect().bottom + 'px';
    item_content_dom.style.left = this.el.nativeElement.getBoundingClientRect().left + 'px';
    if (this.getStyle(item_content_dom, 'display') === 'block') {
      item_content_dom.style.display = 'none';
      item_content_dom.style.position = 'static';
      this.el.nativeElement.style.borderBottom = '1px solid #e4e4e4';
    } else {
      item_content_dom.style.display = 'block';
      item_content_dom.style.position = 'fixed';
      this.el.nativeElement.style.borderBottom = 'none';
    }
  }

}
