import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

declare var TMap: any;

@Component({
  selector: 'app-tencent-map',
  templateUrl: './tencent-map.component.html',
  styleUrls: ['./tencent-map.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TencentMapComponent implements OnInit {
  @Input() geoLocation;

  public marker;

  public circle;

  public infoWindow;

  public mapSearchValue = "";

  public suggestionList = [];

  public map;

  public searchMarkers;

  public geocoder;

  constructor() { }

  ngOnInit(): void {
    const center = new TMap.LatLng(39.984104, 116.307503);
    //初始化地图
    this.map = new TMap.Map(document.getElementById('map-container'), {
      zoom: 12,
      // panControl: false,         //平移控件的初始启用/停用状态。
      // zoomControl: false,       //缩放控件的初始启用/停用状态。
      // scaleControl: false,
      center: center, //设置地图中心点坐标
    });

    this.geocoder = new TMap.service.Geocoder();

    // 创建信息窗口
    this.infoWindow = new TMap.InfoWindow({
      map: this.map,
      // enableCustom: true,
      position: this.map.getCenter(), //设置信息框位置
      offset: {   // 设置信息弹窗的偏移量，否则会和marker重合
        x: 0,
        y: -20
      },
      content: `
         <div class="info-box">
           <p class="info-address"></p>
           <div class="slider-container">
             <div class="slider-bar">
               <div class="slider-progress"></div>
               <div class="slider-dot"></div>
             </div>
             <p class="slider-number">2km</p>
           </div>
           <div class="slider-button-box">
             <span class="slider-button">确定</span>
           </div>
         </div>
      `
    });

    this.searchMarkers = new TMap.MultiMarker({
      map: this.map,
      geometries: [],
    });

    this.infoWindow.close();

    this.setMapSuggestion();
  }

  setMapSuggestion() {
    // 添加标记、信息窗口
    this.map.on("click", (evt) => {
      // 清空图层
      if (this.marker) {
        this.marker.setMap(null);
        this.marker = null;
      }
      if(this.circle) {
        this.circle.setMap(null);
        this.circle = null;
      }

      // 创建标记
      if(!this.marker) {
        const location = new TMap.LatLng(evt.latLng.lat,evt.latLng.lng);

        this.marker = new TMap.MultiMarker({
          id: 'marker-layer',
          position: location,
          map: this.map
        });
        this.marker.add({
          position: evt.latLng
        });

        // 创建搜索范围圆
        this.circle = new TMap.MultiCircle({
          id: 'circle',
          map: this.map,
          geometries: [{
            center: evt.latLng,       // 设置圆的中心
            radius: 2000  //设置圆的半径
          }]
        });

        // 将给定的坐标位置转换为地址
        this.geocoder.getAddress({ location: location }) .then((result) => {
          if(this.marker) {
            //打开信息窗
            this.setInfoWindow(result.result.address,evt.latLng);
          }
        });
      }

    });
  }

  // 搜索
  changeMapList() {
    if(this.circle) {
      this.circle.setMap(null);
      this.circle = null;
    }
    if(this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }
    this.infoWindow.close();

    this.searchMarkers.setGeometries([]);

    if(!this.mapSearchValue) {
      this.suggestionList = [];
      return;
    }

    const suggest = new TMap.service.Suggestion({
      // 新建一个关键字输入提示类
      pageSize: 10, // 返回结果每页条目数
      region: '北京', // 限制城市范围
    });

    const infoWindowList = Array(10);

    suggest.getSuggestions({ keyword: this.mapSearchValue}).then((result) => {
      if(result.data.length > 0) {
        this.suggestionList = result.data;
        result.data.forEach((item, index) => {
          const geometries = this.searchMarkers.getGeometries();
          infoWindowList[index] = this.infoWindow;
          geometries.push({
            id: String(index),
            position: item.location,
          });
          this.searchMarkers.updateGeometries(geometries);
        });
      } else {
        this.suggestionList = [];
      }

    }).catch((error) => {});

    this.searchMarkers.on('click', (e) => {
      if(this.circle) {
        this.circle.setMap(null);
        this.circle = null;
      }
      if(this.marker) {
        this.marker.setMap(null);
        this.marker = null;
      }
      this.infoWindow.close();
      infoWindowList.forEach(infoItem => {
        infoItem.close();
      });
      // 创建搜索范围圆
      this.circle = new TMap.MultiCircle({
        id: 'circle',
        map: this.map,
        geometries: [{
          center: e.geometry.position,       // 设置圆的中心
          radius: 2000  //设置圆的半径
        }]
      });

      this.map.setCenter(this.suggestionList[Number(e.geometry.id)].location);

      //打开信息窗
      this.infoWindow = infoWindowList[Number(e.geometry.id)];
      this.setInfoWindow(this.suggestionList[Number(e.geometry.id)].title,this.suggestionList[Number(e.geometry.id)].location);
    });
  }

  // 点击列表具体地址
  setSuggestion(item) {
    // 清空图层
    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }
    if(this.circle) {
      this.circle.setMap(null);
      this.circle = null;
    }

    this.infoWindow.close();

    // 创建标记
    if(!this.marker) {
      const location = new TMap.LatLng(item.location.lat,item.location.lng);

      this.marker = new TMap.MultiMarker({
        id: 'marker-layer',
        position: location,
        map: this.map
      });
      this.marker.add({
        position: item.location
      });

      // 创建搜索范围圆
      this.circle = new TMap.MultiCircle({
        id: 'circle',
        map: this.map,
        geometries: [{
          center: item.location,       // 设置圆的中心
          radius: 2000  //设置圆的半径
        }]
      });

      this.map.setCenter(item.location);

      //打开信息窗
      this.setInfoWindow(item.title,item.location);
    }
  }

  // 设置窗口信息
  setInfoWindow(address,position) {
    this.infoWindow.open();
    this.infoWindow.setPosition(position); //设置信息窗位置
    this.infoWindow.setContent(
      `
       <div class="info-box">
         <p class="info-address">${address}</p>
         <div class="slider-container">
           <div class="slider-bar">
             <div class="slider-progress"></div>
             <div class="slider-dot"></div>
           </div>
           <p class="slider-number">2km</p>
         </div>
         <div class="slider-button-box">
           <span class="slider-button">确定</span>
         </div>
       </div>
       `
    ); //设置信息窗内容

    const content = document.getElementsByClassName('slider-container')[0];
    const bar = document.getElementsByClassName('slider-bar')[0];
    const progress = document.getElementsByClassName('slider-progress')[0];
    const dot = document.getElementsByClassName('slider-dot')[0];
    const p = document.getElementsByClassName('slider-number')[0];
    const button = document.getElementsByClassName('slider-button')[0];
    progress['style'].width = 19.2 + 'px';
    dot['style'].left = 18 + 'px';
    // 总长度减去原点覆盖的部分
    const rest = bar['offsetWidth'] - dot['offsetWidth'];
    let bili = 2;
    dot.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      event.preventDefault();
      const dotL = dot['offsetLeft'];
      const e = event || window.event; //兼容性
      const mouseX = e['clientX']; //鼠标按下的位置
      content['onmousemove'] = ev => {
        this.circle.setMap(null);
        this.circle = null;
        const info = ev || window.event;
        // 浏览器当前位置减去鼠标按下的位置
        const moveL = info.clientX - mouseX; //鼠标移动的距离

        // 保存newL是必要的
        let newL = dotL + moveL;    //left值
        // 判断最大值和最小值
        if (newL < 4.48) {
          newL = 4.48;
        }
        if (newL >= rest) {
          newL = rest;
        }
        // 改变left值
        dot['style'].left = newL + 'px';
        // 计算比例
        bili = newL / rest * 25;
        p.innerHTML = bili.toFixed(1) + 'km';
        this.circle = new TMap.MultiCircle({
          id: 'circle',
          map: this.map,
          geometries: [{
            center: position,       // 设置圆的中心
            radius: Number(bili.toFixed(1)) * 1000  //设置圆的半径
          }]
        });
        progress['style'].width = 240 * Number(bili.toFixed(1))/25 + 'px';
        return false; //取消默认事件
      };

      content['onmouseup'] = () => {
        content['onmousemove'] = null; //解绑移动事件
        return false;
      };
      return false;
    });

    button.addEventListener('click',(event) => {
      this.circle.setMap(null);
      this.circle = null;
      this.infoWindow.close();
      this.geoLocation.custom_locations.push({longitude: position.lng, latitude: position.lat, radius: Number(bili.toFixed(1)), address: address});
    });
  }

}
