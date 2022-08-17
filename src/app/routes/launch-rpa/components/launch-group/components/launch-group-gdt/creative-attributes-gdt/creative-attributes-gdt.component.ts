import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {LaunchRpaService} from "../../../../../service/launch-rpa.service";
import {NzMessageService} from "ng-zorro-antd/message";

@Component({
  selector: 'app-creative-attributes-gdt',
  templateUrl: './creative-attributes-gdt.component.html',
  styleUrls: ['./creative-attributes-gdt.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreativeAttributesGdtComponent implements OnInit {
  @Input() materialData;
  @Input() defaultData;
  @Input() checkErrorTip;
  @Input() targetChannelList;
  @Input() linkNameTypeList;
  @Input() structConfig;

  public curConversionAssistIndex = 0;

  public conversionTargetTypeList = [];

  constructor(public launchRpaService: LaunchRpaService,private message: NzMessageService,) { }

  ngOnInit(): void {
    if(this.materialData.by_channel_set_conversion_assist) {
      this.getConversionTargetTypeList(this.materialData.conversion_assist[this.targetChannelList[0].convert_channel_id],this.materialData.conversion_assist[this.targetChannelList[0].convert_channel_id].link_name_type);
    } else {
      this.getConversionTargetTypeList(this.materialData.conversion_assist['all'],this.materialData.conversion_assist['all'].link_name_type);
    }
  }

  changeConversionAssistByChannel() {
    this.materialData.conversion_assist['all'] = {
      link_name_switch: false,
      conversion_data_switch: false,
      link_name_type: "",
      link_page_type: "LINK_PAGE_TYPE_CANVAS_WECHAT",
      link_page_spec: {
        page_url: "",
        mini_program_id: "",
        mini_program_path: "",
      },
      conversion_data_type: "CONVERSION_DATA_ADMETRIC",
      conversion_target_type: "",
      page_track_url: "",
    };
    this.targetChannelList.forEach(item => {
      this.materialData.conversion_assist[item.convert_channel_id] = {
        link_name_switch: false,
        conversion_data_switch: false,
        link_name_type: "",
        link_page_type: "LINK_PAGE_TYPE_CANVAS_WECHAT",
        link_page_spec: {
          page_url: "",
          mini_program_id: "",
          mini_program_path: "",
        },
        conversion_data_type: "CONVERSION_DATA_ADMETRIC",
        conversion_target_type: "",
        page_track_url: "",
      };
    });
  }

  changeLinkName(data,value) {
    if(value === 'WATCH_LIVE') {
      data.conversion_data_switch = false;
    } else {
      this.getConversionTargetTypeList(data,value);
    }
  }

  getConversionTargetTypeList(data,value) {
    this.launchRpaService.getConversionTargetTypeList({link_name_type: value}, {}).subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          this.conversionTargetTypeList = results['data'];
          data.conversion_target_type = results['data'][0].key;
        } else {
          this.message.error(results['message']);
        }
      },
      (err: any) => {
        this.message.error('数据获取异常，请重试');
      },
      () => {
      },
    );
  }

}
