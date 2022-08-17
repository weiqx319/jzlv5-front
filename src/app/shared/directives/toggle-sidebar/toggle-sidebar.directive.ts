import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appToggleSidebar]'
})
export class ToggleSidebarDirective {

  constructor(private el: ElementRef) {
  }

  @HostListener('click', ['$event']) onClick(e) {
    this.el.nativeElement.parentNode.parentNode.parentNode.classList.toggle('dashboard-nav-size-btn-mr');
    this.el.nativeElement.parentNode.parentNode.parentNode.classList.toggle('sidebar-show');
    this.el.nativeElement.parentNode.classList.toggle('sidebar-show');
    this.el.nativeElement.children[0].classList.toggle('anticon-right');
    this.el.nativeElement.children[0].classList.toggle('anticon-left');
  }
}
