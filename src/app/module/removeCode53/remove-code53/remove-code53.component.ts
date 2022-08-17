import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductDataService} from "@jzl/jzl-product";

@Component({
  selector: 'app-remove-code53',
  templateUrl: './remove-code53.component.html',
  styleUrls: ['./remove-code53.component.scss']
})
export class RemoveCode53Component implements OnInit, OnDestroy {

  private kf53: any;
  private jzlCode:any;
  constructor(private productService: ProductDataService) {}
  ngOnDestroy(): void {
    if (this.kf53 && this.kf53.parentNode) {
      this.kf53.parentNode.removeChild(this.kf53);
    }
    if (document.getElementById('hz6d_flp_jquery')) {
      document.getElementById('hz6d_flp_jquery').parentNode.removeChild(document.getElementById('hz6d_flp_jquery'));
    }
    if (document.getElementById('ivt_script')) {
      document.getElementById('ivt_script').parentNode.removeChild(document.getElementById('ivt_script'));
    }
    if (document.getElementById('kf53_nb')) {
      document.getElementById('kf53_nb').parentNode.removeChild(document.getElementById('kf53_nb'));
    }
    if (document.getElementById('kfivtwin')) {
      document.getElementById('kfivtwin').parentNode.removeChild(document.getElementById('kfivtwin'));
    }
    if (document.getElementById('div_company_mini')) {
      document.getElementById('div_company_mini').parentNode.removeChild(document.getElementById('div_company_mini'));
    }
    if ( document.getElementById('kfivteffect')) {
      document.getElementById('kfivteffect').parentNode.removeChild(document.getElementById('kfivteffect'));
    }
    if ( document.getElementById('kfiframe')) {
      document.getElementById('kfiframe').parentNode.removeChild(document.getElementById('kfiframe'));
    }
    if (document.getElementById('icon_module')) {
      document.getElementById('icon_module').parentNode.removeChild(document.getElementById('icon_module'));
    }
  }

  ngOnInit() {
    this.productService.getDataInfo().then((res) => {
      const productInfo = res;
      if (productInfo['name'] === '九枝兰') {
        this.kf53 = document.createElement('script');
        this.kf53.setAttribute('id', 'kf53');
        this.kf53.innerHTML = ' (function () {\n' +
          '       var _53code=document.createElement("script");\n' +
          '       _53code.setAttribute(\'id\', \'kf53_nb\');\n' +
          '       _53code.src = "https://tb.53kf.com/code/code/10194791/2";\n' +
          '       var s = document.getElementsByTagName("script")[0];\n' +
          '       s.parentNode.insertBefore(_53code, s);\n' +
          '\n' +
          '      })(); ';
        document.body.appendChild(this.kf53);
      }
    });

    this.jzlCode = document.createElement('script');
    this.jzlCode.innerHTML =  "" +
      "var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];\n" +
      "    var myDate = new Date();\n" +
      "    date=myDate.getFullYear()+''+myDate.getMonth()+''+myDate.getDate();\n" +
      "    g.type = 'text/javascript';g.defer = true; g.async = true;\n" +
      "    g.src=\"//trace.jiuzhilan.com/codes/jiuzhilan_25.js?\"+date;\n" +
      "    s.parentNode.insertBefore(g, s);";
    document.body.appendChild(this.jzlCode);


  }

}
