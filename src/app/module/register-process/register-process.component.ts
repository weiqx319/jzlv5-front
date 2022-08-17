import { Component, Input, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-register-process',
  templateUrl: './register-process.component.html',
  styleUrls: ['./register-process.component.scss']
})
export class RegisterProcessComponent implements OnInit {
  @Input() companyPubAccountNum;

  public productInfo = {};

  public imgPath = [
    '../../../assets/register_process1.png',
    '../../../assets/register_process2.png',
    '../../../assets/register_process3.png',
    '../../../assets/register_process4.png',
    '../../../assets/register_process5.png',
    '../../../assets/register_process6.png',
    '../../../assets/register_process7.png',
    '../../../assets/register_process8.png',
    '../../../assets/register_process9.png',
  ];

  public imgIndex = 0;
  public isShowRegisterProcess = true;

  constructor(private router: Router, private productService: ProductDataService) {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }

  ngOnInit() {
  }

  goToImgPath(isNext) {
    this.imgIndex = isNext ? this.imgIndex + 1 : this.imgIndex - 1;
  }

  goToFirst() {
    this.imgIndex = 0;
  }

  hideRegisterProcess() {
    this.router.navigateByUrl( '/manage/account/account_binding');
    setTimeout(() => {
      this.isShowRegisterProcess = false;
    }, 1000);
  }
}
