import { Component, OnInit } from '@angular/core';
import {deepCopy} from "@jzl/jzl-util";

@Component({
  selector: 'app-add-fengwu-creative',
  templateUrl: './add-fengwu-creative.component.html',
  styleUrls: ['./add-fengwu-creative.component.scss']
})
export class AddFengwuCreativeComponent implements OnInit {

  constructor() { }

  public isOther=true;
  public button_text=null;
  public submit = false;
  public creative_type='windows';
  public device=1;
  public creativeType=[
    { "key": "windows","name": "凤舞橱窗"},
    { "key": "guides","name": "凤舞导航"},
    { "key": "lists","name": "凤舞列表"},
    { "key": "links","name": "凤舞长子链"},
    { "key": "sublinks","name": "凤舞短子链"},
    { "key": "short_guides","name": "凤舞短导航"},
    { "key": "potential","name": "凤舞寻客"},
  ];
  public infoObj={
    "windows":{
      name: "凤舞橱窗",
      title:'凤舞橱窗，图文结合，让广告脱颖而出！',
      desc:'多图结构化样式，呈现更丰富的商品信息，有效提升转化！',
      note:{
        1:'请填写4个商品，商品名不能重复，图片不能重复',
        2:'请填写3到8个商品，商品名不能重复，图片不能重复'
      },
      1:{min_length:4,max_length:4},
      2:{min_length:3,max_length:8}
    },
    "guides":{
      name: "凤舞导航",
      title:'凤舞导航，突出重点信息，提升转化点击！',
      desc:'针对网民检索需求，突出推广站点业务所在，节省推广成本！',
      note:{
        1:'单个导航3-10个子链，标签名和链接文字共16-59个字符，链接文字不能重复。',
        2:'请填写2-6个导航，每个导航2-10个子链；标签名不能重复，链接文字不能重复。'
      },
      1:{min_length:3,max_length:3,min_link:3,max_link:10},
      2:{min_length:2,max_length:6,min_link:2,max_link:10}
    },
    "lists":{
      name: "凤舞列表",
      title:'凤舞高级创意让您的广告脱颖而出！',
      desc:null,
      note:{
        1:'请填写4到6个商品。',
      },
      1:{min_length:4,max_length:6},
    },
    "links":{
      name: "凤舞长子链",
      title:'凤舞长子链，丰富推广信息，提高推广准确性！',
      desc:'披露更详细的推广信息，准确定位目标客户，节省转化成本！',
      note:{
        1:'请填写2-10个长子链。',
        2:'请填写3-10个长子链。'
      },
      1:{min_length:2,max_length:10},
      2:{min_length:3,max_length:10}
    },
    "sublinks":{
      name: "凤舞短子链",
      title:'凤舞短子链，突出业务信息，提高有效转化！',
      desc:'突出展示有效信息，让您的推广吸引更多关注，获得更好推广效果！',
      note:{
        1:'请填写4-10个子链，少于4个将无法展现',
        2:'请填写2-10个子链，少于2个将无法展现'
      },
      1:{min_length:4,max_length:10},
      2:{min_length:2,max_length:10}
    },
    "short_guides":{
      name: "凤舞短导航",
      title:'凤舞高级创意让您的广告脱颖而出！',
      desc:'凤舞高级创意让您的广告脱颖而出！',
      note:{
        1:'请填写2或4个短导航；标签名不能重复；每个导航2-4个子链，链接文字不能重复。',
      },
      1:{min_length:2,max_length:4,min_link:2,max_link:4},
    },
    "potential":{
      name: "凤舞寻客",
      title:'凤舞高级创意让您的广告脱颖而出！',
      desc:'凤舞高级创意让您的广告脱颖而出！',
      note:{
        1:'请选择2-4个字段（多个自定义项记为多个），自定义项不能重复',
      },
      1:{min_length:1,max_length:1},
    },
  };
  public templateObj={
    "windows":{
      "title": "",
      "description": "",
      "url": "",
      "image": ""
    },
    "guides":{
      "title": "",
      "links": []
    },
    "lists":{
      "title": "",
      "description": "",
      "text": "",
      "clicktitle": '点击查看',
      "url": ""
    },
    "links":{
      "dece": "",
      "text": "",
      "url": ""
    },
    "sublinks":{
      "text": "",
      "url": ""
    },
    "short_guides":{
      "title": "",
      "links": []
    },
    "potential":{
      "areas": 1,
      "button": "",
      "contact": 1,
      "name": 1,
      "others": [
        {"key": "", "value": []}
      ],
      "title": ""
    }
  };
  public resultData={
    "windows":[],
    "guides":[],
    "lists":[],
    "links":[],
    "sublinks":[],
    "short_guides":[],
    "potential":{},
  };
  public buttonText=['点击查看','点击报名','点击购买','点击进入','点击预定','点击注册','点击咨询'];
  public lengthLimit={
    "windows":{
      "title_1":{min:2,max:16},
      "title_2":{min:4,max:26},
      "text_1": {min:2,max:16},
      "text_2": {min:2,max:13}
    },
    "guides":{
      "title_1":{min:4,max:8},
      "title_2":{min:4,max:8},
      "text_1": {min:3,max:16},
      "text_2": {min:4,max:16}
    },
    "short_guides":{
      "title_1":{min:4,max:8},
      "text_1": {min:4,max:14},
    },
    "links":{
      "title_1":{min:4,max:8},
      "title_2":{min:4,max:8},
      "text_1": {min:15,max:76},
      "text_2": {min:12,max:60}
    },
    "sublinks":{
      "text_1": {min:4,max:14},
      "text_2": {min:8,max:16}
    }
  };
  public errorTip={
    url:{
      is_show: false,
      tip_text: '请输入以http://或https://开头的有效网址'
    },
    title:{
      is_show: false,
      tip_text: '请输入2-16位有效字符'
    },
    text:{
      is_show: false,
      tip_text: '请输入2-16位有效字符'
    },
    description:{
      is_show: false,
      tip_text: '请输入2-16位有效字符'
    },
    image:{
      is_show: false,
      tip_text: '请上传图片'
    },
    other_title:{
      is_show: false,
      tip_text: '请输入4-8位有效字符'
    },
    other_desc:{
      is_show: false,
      tip_text: '每行一项，请填写1-20项，每项最多16个字符'
    },
  };
  public otherValueErr=[false,false,false];

  ngOnInit(): void {
    this.creativeTypeChange('windows');
  }
  refreshErrData() {
    ['url','title','text','description','image','other_title','other_desc'].forEach(item=> {
      this.errorTip[item].is_show=false;
    });
  }

  creativeTypeChange(event) {
    this.device=1;
    this.refreshErrData();
    if (event==='potential') {
      this.resultData[event]= this.templateObj[event];
    } else {
      this.resultData[event]=[];
      for (let i=0;i<this.infoObj[event][this.device].min_length;i++) {
        const showItem=deepCopy(this.templateObj[event]);
        if (this.creative_type==='guides'||this.creative_type==='short_guides') {
          showItem.links=[];
          for (let k=0;k<this.infoObj[this.creative_type][this.device].min_link;k++) {
            showItem.links.push({"text": "", "url": ""});
          }
        }
        this.resultData[event].push(showItem);
      }
    }
  }
  deviceTypeChange() {
    this.refreshErrData();
    if (this.creative_type==='potential') {
      this.resultData[this.creative_type]= this.templateObj[this.creative_type];
    } else {
      this.resultData[this.creative_type]=[];
      for (let i=0;i<this.infoObj[this.creative_type][this.device].min_length;i++) {
        const showItem=deepCopy(this.templateObj[this.creative_type]);
        if (this.creative_type==='guides'||this.creative_type==='short_guides') {
          showItem.links=[];
          for (let k=0;k<this.infoObj[this.creative_type][this.device].min_link;k++) {
            showItem.links.push({"text": "", "url": ""});
          }
        }
        this.resultData[this.creative_type].push(showItem);
      }
    }

  }

  addLink(data) {
    data.push({"text": "", "url": ""});
  }
  deleteLink(data,index) {
    data.splice(index,1);
  }
  addOthers(data) {
    data.push({"key": "", "value":[]});
  }
  addParams(data) {
    const showItem=deepCopy(this.templateObj[this.creative_type]);
    if (this.creative_type==='guides'||this.creative_type==='short_guides') {
      showItem.links=[];
      for (let k=0;k<this.infoObj[this.creative_type][this.device].min_link;k++) {
        showItem.links.push({"text": "", "url": ""});
      }
    }
    data.push(showItem);
  }
  deleteParams(data,index) {
    data.splice(index,1);
  }
  switchChange(event,data,key) {
    data[key]=event?1:0;
  }
  otherValueChange(event,data) {
    data.value=event.split(/[(\r\n)\r\n]+/);
    this.checkBasicData('potential');
  }
  isShowTextTip(text,min,max) {
    if (!text||text.length<1) {
      return true;
    }
    const LEN=text.replace(/[^\x00-\xff]/g, "aa").length;
    return LEN>max||LEN<min;
  }
  isShowUrlTip(url) {
    return !/http[s]{0,1}:\/\/([\w.]+\/?)\S*/.test(url);
  }
  checkBasicData(type) {
    const result=this.resultData[type];
    let isValid = false;
    if (type==='windows') {
      result.forEach(data=> {
        if (this.isShowTextTip(data.title,this.lengthLimit[type]['title_'+this.device].min,this.lengthLimit[type]['title_'+this.device].max)) {
          this.errorTip.title.is_show=true;
          isValid=true;
        }
        if (this.isShowTextTip(data.dece,this.lengthLimit[type]['text_'+this.device].min,this.lengthLimit[type]['text_'+this.device].max)) {
          this.errorTip.text.is_show=true;
          isValid=true;
        }
        if (this.isShowUrlTip(data.url)) {
          this.errorTip.url.is_show=true;
          isValid=true;
        }
        if (!data.image) {
          this.errorTip.image.is_show=true;
          isValid=true;
        }
      });
    } else if (type==='guides'||type==='short_guides') {
      result.forEach(data=> {
        if (this.isShowTextTip(data.title,4,8)) {
          this.errorTip.title.is_show=true;
          isValid=true;
        }
        data.links.forEach(link=> {
          if (this.isShowTextTip(link.text,this.lengthLimit[type]['text_'+this.device].min,this.lengthLimit[type]['text_'+this.device].max)) {
            this.errorTip.text.is_show=true;
            isValid=true;
          }
          if (this.isShowUrlTip(link.url)) {
            this.errorTip.url.is_show=true;
            isValid=true;
          }
        });
      });

    } else if (type==='links') {
      result.forEach(data=> {
        if (this.isShowTextTip(data.dece,this.lengthLimit[type]['title_'+this.device].min,this.lengthLimit[type]['title_'+this.device].max)) {
          this.errorTip.title.is_show=true;
          isValid=true;
        }
        if (this.isShowTextTip(data.text,this.lengthLimit[type]['text_'+this.device].min,this.lengthLimit[type]['text_'+this.device].max)) {
          this.errorTip.text.is_show=true;
          isValid=true;
        }
        if (this.isShowUrlTip(data.url)) {
          this.errorTip.url.is_show=true;
          isValid=true;
        }
      });

    } else if (type==='sublinks') {
      result.forEach(data=> {
        if (this.isShowTextTip(data.text,this.lengthLimit[type]['text_'+this.device].min,this.lengthLimit[type]['text_'+this.device].max)) {
          this.errorTip.text.is_show=true;
          isValid=true;
        }
        if (this.isShowUrlTip(data.url)) {
          this.errorTip.url.is_show=true;
          isValid=true;
        }
      });
    } else if (type==='lists') {
      result.forEach(data=> {
        if (this.isShowTextTip(data.title,2,28)) {
          this.errorTip.title.is_show=true;
          isValid=true;
        }
        if (this.isShowTextTip(data.text,2,12)) {
          this.errorTip.text.is_show=true;
          isValid=true;
        }
        if (this.isShowTextTip(data.description,2,12)) {
          this.errorTip.description.is_show=true;
          isValid=true;
        }
        if (this.isShowUrlTip(data.url)) {
          this.errorTip.url.is_show=true;
          isValid=true;
        }
      });

    } else if (type==='potential') {
      if (this.isShowTextTip(result.title,0,36)) {
        this.errorTip.title.is_show=true;
        isValid=true;
      }
      if (!/^[\u4e00-\u9fa5]{2,4}$/.test(result.button)) {
        this.errorTip.text.is_show=true;
        isValid=true;
      }
      if (this.isOther) {
        this.errorTip.other_desc.is_show=false;
        this.otherValueErr=[false,false,false];
        result.others.forEach((data,index)=> {
          if (this.isShowTextTip(data.text,4,8)) {
            this.errorTip.other_title.is_show=true;
            isValid=true;
          }
          if (data.value.length===0||data.value.length>20) {
            this.otherValueErr[index]=true;
            this.errorTip.other_desc.is_show=true;
            isValid=true;
          }
          data.value.forEach(word=> {
            if (this.isShowTextTip(word,0,16)) {
              this.otherValueErr[index]=true;
              this.errorTip.other_desc.is_show=true;
              isValid=true;
            }
          });
        });
      }
    }
    return isValid;

  }

  doCancel() {

  }
  doSave() {
    const isValid=this.checkBasicData(this.creative_type);
    if (isValid) {
      return;
    }
    if (!this.submit) {
      this.submit = true;

    }

  }
  goBack() {
    history.go(-1);
  }

}
