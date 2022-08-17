import { Injectable } from "@angular/core";

@Injectable()
export class RegionListService {
  /* North:华北地区
     Northeast:东北地区
     East:华东地区
     South:华南地区
     Central:华中地区
     Southwest:西南地区
     Northwest:西北地区
     HongKong Taiwan Macao:香港 台湾 澳门地区
   */

   private region_list_xhs = [{"name":"全部","level":0,"id":"all","title":"全部","key":"all","parent_id":"","isLeaf":false,"children":[{"name":"北京","level":1,"id":"北京","title":"北京","key":"北京","parent_id":"all","isLeaf":true},{"name":"天津","level":1,"id":"天津","title":"天津","key":"天津","parent_id":"all","isLeaf":true},{"name":"上海","level":1,"id":"上海","title":"上海","key":"上海","parent_id":"all","isLeaf":true},{"name":"重庆","level":1,"id":"重庆","title":"重庆","key":"重庆","parent_id":"all","isLeaf":true},{"name":"河北","children":[{"name":"石家庄","parent_id":"河北","level":2,"id":"石家庄","title":"石家庄","key":"石家庄","isLeaf":true},{"name":"唐山","parent_id":"河北","level":2,"id":"唐山","title":"唐山","key":"唐山","isLeaf":true},{"name":"秦皇岛","parent_id":"河北","level":2,"id":"秦皇岛","title":"秦皇岛","key":"秦皇岛","isLeaf":true},{"name":"邯郸","parent_id":"河北","level":2,"id":"邯郸","title":"邯郸","key":"邯郸","isLeaf":true},{"name":"邢台","parent_id":"河北","level":2,"id":"邢台","title":"邢台","key":"邢台","isLeaf":true},{"name":"保定","parent_id":"河北","level":2,"id":"保定","title":"保定","key":"保定","isLeaf":true},{"name":"张家口","parent_id":"河北","level":2,"id":"张家口","title":"张家口","key":"张家口","isLeaf":true},{"name":"承德","parent_id":"河北","level":2,"id":"承德","title":"承德","key":"承德","isLeaf":true},{"name":"沧州","parent_id":"河北","level":2,"id":"沧州","title":"沧州","key":"沧州","isLeaf":true},{"name":"廊坊","parent_id":"河北","level":2,"id":"廊坊","title":"廊坊","key":"廊坊","isLeaf":true},{"name":"衡水","parent_id":"河北","level":2,"id":"衡水","title":"衡水","key":"衡水","isLeaf":true}],"level":1,"id":"河北","title":"河北","key":"河北","parent_id":"all","isLeaf":false},{"name":"山西","children":[{"name":"太原","parent_id":"山西","level":2,"id":"太原","title":"太原","key":"太原","isLeaf":true},{"name":"大同","parent_id":"山西","level":2,"id":"大同","title":"大同","key":"大同","isLeaf":true},{"name":"阳泉","parent_id":"山西","level":2,"id":"阳泉","title":"阳泉","key":"阳泉","isLeaf":true},{"name":"长治","parent_id":"山西","level":2,"id":"长治","title":"长治","key":"长治","isLeaf":true},{"name":"晋城","parent_id":"山西","level":2,"id":"晋城","title":"晋城","key":"晋城","isLeaf":true},{"name":"朔州","parent_id":"山西","level":2,"id":"朔州","title":"朔州","key":"朔州","isLeaf":true},{"name":"晋中","parent_id":"山西","level":2,"id":"晋中","title":"晋中","key":"晋中","isLeaf":true},{"name":"运城","parent_id":"山西","level":2,"id":"运城","title":"运城","key":"运城","isLeaf":true},{"name":"忻州","parent_id":"山西","level":2,"id":"忻州","title":"忻州","key":"忻州","isLeaf":true},{"name":"临汾","parent_id":"山西","level":2,"id":"临汾","title":"临汾","key":"临汾","isLeaf":true},{"name":"吕梁","parent_id":"山西","level":2,"id":"吕梁","title":"吕梁","key":"吕梁","isLeaf":true}],"level":1,"id":"山西","title":"山西","key":"山西","parent_id":"all","isLeaf":false},{"name":"内蒙古","children":[{"name":"呼和浩特","parent_id":"内蒙古","level":2,"id":"呼和浩特","title":"呼和浩特","key":"呼和浩特","isLeaf":true},{"name":"包头","parent_id":"内蒙古","level":2,"id":"包头","title":"包头","key":"包头","isLeaf":true},{"name":"乌海","parent_id":"内蒙古","level":2,"id":"乌海","title":"乌海","key":"乌海","isLeaf":true},{"name":"赤峰","parent_id":"内蒙古","level":2,"id":"赤峰","title":"赤峰","key":"赤峰","isLeaf":true},{"name":"通辽","parent_id":"内蒙古","level":2,"id":"通辽","title":"通辽","key":"通辽","isLeaf":true},{"name":"鄂尔多斯","parent_id":"内蒙古","level":2,"id":"鄂尔多斯","title":"鄂尔多斯","key":"鄂尔多斯","isLeaf":true},{"name":"呼伦贝尔","parent_id":"内蒙古","level":2,"id":"呼伦贝尔","title":"呼伦贝尔","key":"呼伦贝尔","isLeaf":true},{"name":"巴彦淖尔","parent_id":"内蒙古","level":2,"id":"巴彦淖尔","title":"巴彦淖尔","key":"巴彦淖尔","isLeaf":true},{"name":"乌兰察布","parent_id":"内蒙古","level":2,"id":"乌兰察布","title":"乌兰察布","key":"乌兰察布","isLeaf":true},{"name":"兴安","parent_id":"内蒙古","level":2,"id":"兴安","title":"兴安","key":"兴安","isLeaf":true},{"name":"锡林郭勒","parent_id":"内蒙古","level":2,"id":"锡林郭勒","title":"锡林郭勒","key":"锡林郭勒","isLeaf":true},{"name":"阿拉善","parent_id":"内蒙古","level":2,"id":"阿拉善","title":"阿拉善","key":"阿拉善","isLeaf":true}],"level":1,"id":"内蒙古","title":"内蒙古","key":"内蒙古","parent_id":"all","isLeaf":false},{"name":"辽宁","children":[{"name":"沈阳","parent_id":"辽宁","level":2,"id":"沈阳","title":"沈阳","key":"沈阳","isLeaf":true},{"name":"大连","parent_id":"辽宁","level":2,"id":"大连","title":"大连","key":"大连","isLeaf":true},{"name":"鞍山","parent_id":"辽宁","level":2,"id":"鞍山","title":"鞍山","key":"鞍山","isLeaf":true},{"name":"抚顺","parent_id":"辽宁","level":2,"id":"抚顺","title":"抚顺","key":"抚顺","isLeaf":true},{"name":"本溪","parent_id":"辽宁","level":2,"id":"本溪","title":"本溪","key":"本溪","isLeaf":true},{"name":"丹东","parent_id":"辽宁","level":2,"id":"丹东","title":"丹东","key":"丹东","isLeaf":true},{"name":"锦州","parent_id":"辽宁","level":2,"id":"锦州","title":"锦州","key":"锦州","isLeaf":true},{"name":"营口","parent_id":"辽宁","level":2,"id":"营口","title":"营口","key":"营口","isLeaf":true},{"name":"阜新","parent_id":"辽宁","level":2,"id":"阜新","title":"阜新","key":"阜新","isLeaf":true},{"name":"辽阳","parent_id":"辽宁","level":2,"id":"辽阳","title":"辽阳","key":"辽阳","isLeaf":true},{"name":"盘锦","parent_id":"辽宁","level":2,"id":"盘锦","title":"盘锦","key":"盘锦","isLeaf":true},{"name":"铁岭","parent_id":"辽宁","level":2,"id":"铁岭","title":"铁岭","key":"铁岭","isLeaf":true},{"name":"朝阳","parent_id":"辽宁","level":2,"id":"朝阳","title":"朝阳","key":"朝阳","isLeaf":true},{"name":"葫芦岛","parent_id":"辽宁","level":2,"id":"葫芦岛","title":"葫芦岛","key":"葫芦岛","isLeaf":true}],"level":1,"id":"辽宁","title":"辽宁","key":"辽宁","parent_id":"all","isLeaf":false},{"name":"吉林","children":[{"name":"长春","parent_id":"吉林省","level":2,"id":"长春","title":"长春","key":"长春","isLeaf":true},{"name":"吉林","parent_id":"吉林省","level":2,"id":"吉林","title":"吉林","key":"吉林","isLeaf":true},{"name":"四平","parent_id":"吉林省","level":2,"id":"四平","title":"四平","key":"四平","isLeaf":true},{"name":"辽源","parent_id":"吉林省","level":2,"id":"辽源","title":"辽源","key":"辽源","isLeaf":true},{"name":"通化","parent_id":"吉林省","level":2,"id":"通化","title":"通化","key":"通化","isLeaf":true},{"name":"白山","parent_id":"吉林省","level":2,"id":"白山","title":"白山","key":"白山","isLeaf":true},{"name":"松原","parent_id":"吉林省","level":2,"id":"松原","title":"松原","key":"松原","isLeaf":true},{"name":"白城","parent_id":"吉林省","level":2,"id":"白城","title":"白城","key":"白城","isLeaf":true},{"name":"延边","parent_id":"吉林省","level":2,"id":"延边","title":"延边","key":"延边","isLeaf":true}],"level":1,"id":"吉林省","title":"吉林","key":"吉林省","parent_id":"all","isLeaf":false},{"name":"黑龙江","children":[{"name":"哈尔滨","parent_id":"黑龙江","level":2,"id":"哈尔滨","title":"哈尔滨","key":"哈尔滨","isLeaf":true},{"name":"齐齐哈尔","parent_id":"黑龙江","level":2,"id":"齐齐哈尔","title":"齐齐哈尔","key":"齐齐哈尔","isLeaf":true},{"name":"鸡西","parent_id":"黑龙江","level":2,"id":"鸡西","title":"鸡西","key":"鸡西","isLeaf":true},{"name":"鹤岗","parent_id":"黑龙江","level":2,"id":"鹤岗","title":"鹤岗","key":"鹤岗","isLeaf":true},{"name":"双鸭山","parent_id":"黑龙江","level":2,"id":"双鸭山","title":"双鸭山","key":"双鸭山","isLeaf":true},{"name":"大庆","parent_id":"黑龙江","level":2,"id":"大庆","title":"大庆","key":"大庆","isLeaf":true},{"name":"伊春","parent_id":"黑龙江","level":2,"id":"伊春","title":"伊春","key":"伊春","isLeaf":true},{"name":"佳木斯","parent_id":"黑龙江","level":2,"id":"佳木斯","title":"佳木斯","key":"佳木斯","isLeaf":true},{"name":"七台河","parent_id":"黑龙江","level":2,"id":"七台河","title":"七台河","key":"七台河","isLeaf":true},{"name":"牡丹江","parent_id":"黑龙江","level":2,"id":"牡丹江","title":"牡丹江","key":"牡丹江","isLeaf":true},{"name":"黑河","parent_id":"黑龙江","level":2,"id":"黑河","title":"黑河","key":"黑河","isLeaf":true},{"name":"绥化","parent_id":"黑龙江","level":2,"id":"绥化","title":"绥化","key":"绥化","isLeaf":true},{"name":"大兴安岭","parent_id":"黑龙江","level":2,"id":"大兴安岭","title":"大兴安岭","key":"大兴安岭","isLeaf":true}],"level":1,"id":"黑龙江","title":"黑龙江","key":"黑龙江","parent_id":"all","isLeaf":false},{"name":"江苏","children":[{"name":"南京","parent_id":"江苏","level":2,"id":"南京","title":"南京","key":"南京","isLeaf":true},{"name":"无锡","parent_id":"江苏","level":2,"id":"无锡","title":"无锡","key":"无锡","isLeaf":true},{"name":"徐州","parent_id":"江苏","level":2,"id":"徐州","title":"徐州","key":"徐州","isLeaf":true},{"name":"常州","parent_id":"江苏","level":2,"id":"常州","title":"常州","key":"常州","isLeaf":true},{"name":"苏州","parent_id":"江苏","level":2,"id":"苏州","title":"苏州","key":"苏州","isLeaf":true},{"name":"南通","parent_id":"江苏","level":2,"id":"南通","title":"南通","key":"南通","isLeaf":true},{"name":"连云港","parent_id":"江苏","level":2,"id":"连云港","title":"连云港","key":"连云港","isLeaf":true},{"name":"淮安","parent_id":"江苏","level":2,"id":"淮安","title":"淮安","key":"淮安","isLeaf":true},{"name":"盐城","parent_id":"江苏","level":2,"id":"盐城","title":"盐城","key":"盐城","isLeaf":true},{"name":"扬州","parent_id":"江苏","level":2,"id":"扬州","title":"扬州","key":"扬州","isLeaf":true},{"name":"镇江","parent_id":"江苏","level":2,"id":"镇江","title":"镇江","key":"镇江","isLeaf":true},{"name":"泰州","parent_id":"江苏","level":2,"id":"泰州","title":"泰州","key":"泰州","isLeaf":true},{"name":"宿迁","parent_id":"江苏","level":2,"id":"宿迁","title":"宿迁","key":"宿迁","isLeaf":true}],"level":1,"id":"江苏","title":"江苏","key":"江苏","parent_id":"all","isLeaf":false},{"name":"浙江","children":[{"name":"杭州","parent_id":"浙江","level":2,"id":"杭州","title":"杭州","key":"杭州","isLeaf":true},{"name":"宁波","parent_id":"浙江","level":2,"id":"宁波","title":"宁波","key":"宁波","isLeaf":true},{"name":"温州","parent_id":"浙江","level":2,"id":"温州","title":"温州","key":"温州","isLeaf":true},{"name":"嘉兴","parent_id":"浙江","level":2,"id":"嘉兴","title":"嘉兴","key":"嘉兴","isLeaf":true},{"name":"湖州","parent_id":"浙江","level":2,"id":"湖州","title":"湖州","key":"湖州","isLeaf":true},{"name":"绍兴","parent_id":"浙江","level":2,"id":"绍兴","title":"绍兴","key":"绍兴","isLeaf":true},{"name":"金华","parent_id":"浙江","level":2,"id":"金华","title":"金华","key":"金华","isLeaf":true},{"name":"衢州","parent_id":"浙江","level":2,"id":"衢州","title":"衢州","key":"衢州","isLeaf":true},{"name":"舟山","parent_id":"浙江","level":2,"id":"舟山","title":"舟山","key":"舟山","isLeaf":true},{"name":"台州","parent_id":"浙江","level":2,"id":"台州","title":"台州","key":"台州","isLeaf":true},{"name":"丽水","parent_id":"浙江","level":2,"id":"丽水","title":"丽水","key":"丽水","isLeaf":true}],"level":1,"id":"浙江","title":"浙江","key":"浙江","parent_id":"all","isLeaf":false},{"name":"安徽","children":[{"name":"合肥","parent_id":"安徽","level":2,"id":"合肥","title":"合肥","key":"合肥","isLeaf":true},{"name":"芜湖","parent_id":"安徽","level":2,"id":"芜湖","title":"芜湖","key":"芜湖","isLeaf":true},{"name":"蚌埠","parent_id":"安徽","level":2,"id":"蚌埠","title":"蚌埠","key":"蚌埠","isLeaf":true},{"name":"淮南","parent_id":"安徽","level":2,"id":"淮南","title":"淮南","key":"淮南","isLeaf":true},{"name":"马鞍山","parent_id":"安徽","level":2,"id":"马鞍山","title":"马鞍山","key":"马鞍山","isLeaf":true},{"name":"淮北","parent_id":"安徽","level":2,"id":"淮北","title":"淮北","key":"淮北","isLeaf":true},{"name":"铜陵","parent_id":"安徽","level":2,"id":"铜陵","title":"铜陵","key":"铜陵","isLeaf":true},{"name":"安庆","parent_id":"安徽","level":2,"id":"安庆","title":"安庆","key":"安庆","isLeaf":true},{"name":"黄山","parent_id":"安徽","level":2,"id":"黄山","title":"黄山","key":"黄山","isLeaf":true},{"name":"滁州","parent_id":"安徽","level":2,"id":"滁州","title":"滁州","key":"滁州","isLeaf":true},{"name":"阜阳","parent_id":"安徽","level":2,"id":"阜阳","title":"阜阳","key":"阜阳","isLeaf":true},{"name":"宿州","parent_id":"安徽","level":2,"id":"宿州","title":"宿州","key":"宿州","isLeaf":true},{"name":"六安","parent_id":"安徽","level":2,"id":"六安","title":"六安","key":"六安","isLeaf":true},{"name":"亳州","parent_id":"安徽","level":2,"id":"亳州","title":"亳州","key":"亳州","isLeaf":true},{"name":"池州","parent_id":"安徽","level":2,"id":"池州","title":"池州","key":"池州","isLeaf":true},{"name":"宣城","parent_id":"安徽","level":2,"id":"宣城","title":"宣城","key":"宣城","isLeaf":true}],"level":1,"id":"安徽","title":"安徽","key":"安徽","parent_id":"all","isLeaf":false},{"name":"福建","children":[{"name":"福州","parent_id":"福建","level":2,"id":"福州","title":"福州","key":"福州","isLeaf":true},{"name":"厦门","parent_id":"福建","level":2,"id":"厦门","title":"厦门","key":"厦门","isLeaf":true},{"name":"莆田","parent_id":"福建","level":2,"id":"莆田","title":"莆田","key":"莆田","isLeaf":true},{"name":"三明","parent_id":"福建","level":2,"id":"三明","title":"三明","key":"三明","isLeaf":true},{"name":"泉州","parent_id":"福建","level":2,"id":"泉州","title":"泉州","key":"泉州","isLeaf":true},{"name":"漳州","parent_id":"福建","level":2,"id":"漳州","title":"漳州","key":"漳州","isLeaf":true},{"name":"南平","parent_id":"福建","level":2,"id":"南平","title":"南平","key":"南平","isLeaf":true},{"name":"龙岩","parent_id":"福建","level":2,"id":"龙岩","title":"龙岩","key":"龙岩","isLeaf":true},{"name":"宁德","parent_id":"福建","level":2,"id":"宁德","title":"宁德","key":"宁德","isLeaf":true}],"level":1,"id":"福建","title":"福建","key":"福建","parent_id":"all","isLeaf":false},{"name":"江西","children":[{"name":"南昌","parent_id":"江西","level":2,"id":"南昌","title":"南昌","key":"南昌","isLeaf":true},{"name":"景德镇","parent_id":"江西","level":2,"id":"景德镇","title":"景德镇","key":"景德镇","isLeaf":true},{"name":"萍乡","parent_id":"江西","level":2,"id":"萍乡","title":"萍乡","key":"萍乡","isLeaf":true},{"name":"九江","parent_id":"江西","level":2,"id":"九江","title":"九江","key":"九江","isLeaf":true},{"name":"新余","parent_id":"江西","level":2,"id":"新余","title":"新余","key":"新余","isLeaf":true},{"name":"鹰潭","parent_id":"江西","level":2,"id":"鹰潭","title":"鹰潭","key":"鹰潭","isLeaf":true},{"name":"赣州","parent_id":"江西","level":2,"id":"赣州","title":"赣州","key":"赣州","isLeaf":true},{"name":"吉安","parent_id":"江西","level":2,"id":"吉安","title":"吉安","key":"吉安","isLeaf":true},{"name":"宜春","parent_id":"江西","level":2,"id":"宜春","title":"宜春","key":"宜春","isLeaf":true},{"name":"抚州","parent_id":"江西","level":2,"id":"抚州","title":"抚州","key":"抚州","isLeaf":true},{"name":"上饶","parent_id":"江西","level":2,"id":"上饶","title":"上饶","key":"上饶","isLeaf":true}],"level":1,"id":"江西","title":"江西","key":"江西","parent_id":"all","isLeaf":false},{"name":"山东","children":[{"name":"济南","parent_id":"山东","level":2,"id":"济南","title":"济南","key":"济南","isLeaf":true},{"name":"青岛","parent_id":"山东","level":2,"id":"青岛","title":"青岛","key":"青岛","isLeaf":true},{"name":"淄博","parent_id":"山东","level":2,"id":"淄博","title":"淄博","key":"淄博","isLeaf":true},{"name":"枣庄","parent_id":"山东","level":2,"id":"枣庄","title":"枣庄","key":"枣庄","isLeaf":true},{"name":"东营","parent_id":"山东","level":2,"id":"东营","title":"东营","key":"东营","isLeaf":true},{"name":"烟台","parent_id":"山东","level":2,"id":"烟台","title":"烟台","key":"烟台","isLeaf":true},{"name":"潍坊","parent_id":"山东","level":2,"id":"潍坊","title":"潍坊","key":"潍坊","isLeaf":true},{"name":"济宁","parent_id":"山东","level":2,"id":"济宁","title":"济宁","key":"济宁","isLeaf":true},{"name":"泰安","parent_id":"山东","level":2,"id":"泰安","title":"泰安","key":"泰安","isLeaf":true},{"name":"威海","parent_id":"山东","level":2,"id":"威海","title":"威海","key":"威海","isLeaf":true},{"name":"日照","parent_id":"山东","level":2,"id":"日照","title":"日照","key":"日照","isLeaf":true},{"name":"临沂","parent_id":"山东","level":2,"id":"临沂","title":"临沂","key":"临沂","isLeaf":true},{"name":"德州","parent_id":"山东","level":2,"id":"德州","title":"德州","key":"德州","isLeaf":true},{"name":"聊城","parent_id":"山东","level":2,"id":"聊城","title":"聊城","key":"聊城","isLeaf":true},{"name":"滨州","parent_id":"山东","level":2,"id":"滨州","title":"滨州","key":"滨州","isLeaf":true},{"name":"菏泽","parent_id":"山东","level":2,"id":"菏泽","title":"菏泽","key":"菏泽","isLeaf":true}],"level":1,"id":"山东","title":"山东","key":"山东","parent_id":"all","isLeaf":false},{"name":"河南","children":[{"name":"郑州","parent_id":"河南","level":2,"id":"郑州","title":"郑州","key":"郑州","isLeaf":true},{"name":"开封","parent_id":"河南","level":2,"id":"开封","title":"开封","key":"开封","isLeaf":true},{"name":"洛阳","parent_id":"河南","level":2,"id":"洛阳","title":"洛阳","key":"洛阳","isLeaf":true},{"name":"平顶山","parent_id":"河南","level":2,"id":"平顶山","title":"平顶山","key":"平顶山","isLeaf":true},{"name":"安阳","parent_id":"河南","level":2,"id":"安阳","title":"安阳","key":"安阳","isLeaf":true},{"name":"鹤壁","parent_id":"河南","level":2,"id":"鹤壁","title":"鹤壁","key":"鹤壁","isLeaf":true},{"name":"新乡","parent_id":"河南","level":2,"id":"新乡","title":"新乡","key":"新乡","isLeaf":true},{"name":"焦作","parent_id":"河南","level":2,"id":"焦作","title":"焦作","key":"焦作","isLeaf":true},{"name":"濮阳","parent_id":"河南","level":2,"id":"濮阳","title":"濮阳","key":"濮阳","isLeaf":true},{"name":"许昌","parent_id":"河南","level":2,"id":"许昌","title":"许昌","key":"许昌","isLeaf":true},{"name":"漯河","parent_id":"河南","level":2,"id":"漯河","title":"漯河","key":"漯河","isLeaf":true},{"name":"三门峡","parent_id":"河南","level":2,"id":"三门峡","title":"三门峡","key":"三门峡","isLeaf":true},{"name":"南阳","parent_id":"河南","level":2,"id":"南阳","title":"南阳","key":"南阳","isLeaf":true},{"name":"商丘","parent_id":"河南","level":2,"id":"商丘","title":"商丘","key":"商丘","isLeaf":true},{"name":"信阳","parent_id":"河南","level":2,"id":"信阳","title":"信阳","key":"信阳","isLeaf":true},{"name":"周口","parent_id":"河南","level":2,"id":"周口","title":"周口","key":"周口","isLeaf":true},{"name":"驻马店","parent_id":"河南","level":2,"id":"驻马店","title":"驻马店","key":"驻马店","isLeaf":true},{"name":"济源","parent_id":"河南","level":2,"id":"济源","title":"济源","key":"济源","isLeaf":true}],"level":1,"id":"河南","title":"河南","key":"河南","parent_id":"all","isLeaf":false},{"name":"湖北","children":[{"name":"武汉","parent_id":"湖北","level":2,"id":"武汉","title":"武汉","key":"武汉","isLeaf":true},{"name":"黄石","parent_id":"湖北","level":2,"id":"黄石","title":"黄石","key":"黄石","isLeaf":true},{"name":"十堰","parent_id":"湖北","level":2,"id":"十堰","title":"十堰","key":"十堰","isLeaf":true},{"name":"宜昌","parent_id":"湖北","level":2,"id":"宜昌","title":"宜昌","key":"宜昌","isLeaf":true},{"name":"襄阳","parent_id":"湖北","level":2,"id":"襄阳","title":"襄阳","key":"襄阳","isLeaf":true},{"name":"鄂州","parent_id":"湖北","level":2,"id":"鄂州","title":"鄂州","key":"鄂州","isLeaf":true},{"name":"荆门","parent_id":"湖北","level":2,"id":"荆门","title":"荆门","key":"荆门","isLeaf":true},{"name":"孝感","parent_id":"湖北","level":2,"id":"孝感","title":"孝感","key":"孝感","isLeaf":true},{"name":"荆州","parent_id":"湖北","level":2,"id":"荆州","title":"荆州","key":"荆州","isLeaf":true},{"name":"黄冈","parent_id":"湖北","level":2,"id":"黄冈","title":"黄冈","key":"黄冈","isLeaf":true},{"name":"咸宁","parent_id":"湖北","level":2,"id":"咸宁","title":"咸宁","key":"咸宁","isLeaf":true},{"name":"随州","parent_id":"湖北","level":2,"id":"随州","title":"随州","key":"随州","isLeaf":true},{"name":"恩施","parent_id":"湖北","level":2,"id":"恩施","title":"恩施","key":"恩施","isLeaf":true},{"name":"仙桃","parent_id":"湖北","level":2,"id":"仙桃","title":"仙桃","key":"仙桃","isLeaf":true},{"name":"潜江","parent_id":"湖北","level":2,"id":"潜江","title":"潜江","key":"潜江","isLeaf":true},{"name":"天门","parent_id":"湖北","level":2,"id":"天门","title":"天门","key":"天门","isLeaf":true},{"name":"神农架林区","parent_id":"湖北","level":2,"id":"神农架林区","title":"神农架林区","key":"神农架林区","isLeaf":true}],"level":1,"id":"湖北","title":"湖北","key":"湖北","parent_id":"all","isLeaf":false},{"name":"湖南","children":[{"name":"长沙","parent_id":"湖南","level":2,"id":"长沙","title":"长沙","key":"长沙","isLeaf":true},{"name":"株洲","parent_id":"湖南","level":2,"id":"株洲","title":"株洲","key":"株洲","isLeaf":true},{"name":"湘潭","parent_id":"湖南","level":2,"id":"湘潭","title":"湘潭","key":"湘潭","isLeaf":true},{"name":"衡阳","parent_id":"湖南","level":2,"id":"衡阳","title":"衡阳","key":"衡阳","isLeaf":true},{"name":"邵阳","parent_id":"湖南","level":2,"id":"邵阳","title":"邵阳","key":"邵阳","isLeaf":true},{"name":"岳阳","parent_id":"湖南","level":2,"id":"岳阳","title":"岳阳","key":"岳阳","isLeaf":true},{"name":"常德","parent_id":"湖南","level":2,"id":"常德","title":"常德","key":"常德","isLeaf":true},{"name":"张家界","parent_id":"湖南","level":2,"id":"张家界","title":"张家界","key":"张家界","isLeaf":true},{"name":"益阳","parent_id":"湖南","level":2,"id":"益阳","title":"益阳","key":"益阳","isLeaf":true},{"name":"郴州","parent_id":"湖南","level":2,"id":"郴州","title":"郴州","key":"郴州","isLeaf":true},{"name":"永州","parent_id":"湖南","level":2,"id":"永州","title":"永州","key":"永州","isLeaf":true},{"name":"怀化","parent_id":"湖南","level":2,"id":"怀化","title":"怀化","key":"怀化","isLeaf":true},{"name":"娄底","parent_id":"湖南","level":2,"id":"娄底","title":"娄底","key":"娄底","isLeaf":true},{"name":"湘西","parent_id":"湖南","level":2,"id":"湘西","title":"湘西","key":"湘西","isLeaf":true}],"level":1,"id":"湖南","title":"湖南","key":"湖南","parent_id":"all","isLeaf":false},{"name":"广东","children":[{"name":"广州","parent_id":"广东","level":2,"id":"广州","title":"广州","key":"广州","isLeaf":true},{"name":"韶关","parent_id":"广东","level":2,"id":"韶关","title":"韶关","key":"韶关","isLeaf":true},{"name":"深圳","parent_id":"广东","level":2,"id":"深圳","title":"深圳","key":"深圳","isLeaf":true},{"name":"珠海","parent_id":"广东","level":2,"id":"珠海","title":"珠海","key":"珠海","isLeaf":true},{"name":"汕头","parent_id":"广东","level":2,"id":"汕头","title":"汕头","key":"汕头","isLeaf":true},{"name":"佛山","parent_id":"广东","level":2,"id":"佛山","title":"佛山","key":"佛山","isLeaf":true},{"name":"江门","parent_id":"广东","level":2,"id":"江门","title":"江门","key":"江门","isLeaf":true},{"name":"湛江","parent_id":"广东","level":2,"id":"湛江","title":"湛江","key":"湛江","isLeaf":true},{"name":"茂名","parent_id":"广东","level":2,"id":"茂名","title":"茂名","key":"茂名","isLeaf":true},{"name":"肇庆","parent_id":"广东","level":2,"id":"肇庆","title":"肇庆","key":"肇庆","isLeaf":true},{"name":"惠州","parent_id":"广东","level":2,"id":"惠州","title":"惠州","key":"惠州","isLeaf":true},{"name":"梅州","parent_id":"广东","level":2,"id":"梅州","title":"梅州","key":"梅州","isLeaf":true},{"name":"汕尾","parent_id":"广东","level":2,"id":"汕尾","title":"汕尾","key":"汕尾","isLeaf":true},{"name":"河源","parent_id":"广东","level":2,"id":"河源","title":"河源","key":"河源","isLeaf":true},{"name":"阳江","parent_id":"广东","level":2,"id":"阳江","title":"阳江","key":"阳江","isLeaf":true},{"name":"清远","parent_id":"广东","level":2,"id":"清远","title":"清远","key":"清远","isLeaf":true},{"name":"东莞","parent_id":"广东","level":2,"id":"东莞","title":"东莞","key":"东莞","isLeaf":true},{"name":"中山","parent_id":"广东","level":2,"id":"中山","title":"中山","key":"中山","isLeaf":true},{"name":"潮州","parent_id":"广东","level":2,"id":"潮州","title":"潮州","key":"潮州","isLeaf":true},{"name":"揭阳","parent_id":"广东","level":2,"id":"揭阳","title":"揭阳","key":"揭阳","isLeaf":true},{"name":"云浮","parent_id":"广东","level":2,"id":"云浮","title":"云浮","key":"云浮","isLeaf":true}],"level":1,"id":"广东","title":"广东","key":"广东","parent_id":"all","isLeaf":false},{"name":"广西","children":[{"name":"南宁","parent_id":"广西","level":2,"id":"南宁","title":"南宁","key":"南宁","isLeaf":true},{"name":"柳州","parent_id":"广西","level":2,"id":"柳州","title":"柳州","key":"柳州","isLeaf":true},{"name":"桂林","parent_id":"广西","level":2,"id":"桂林","title":"桂林","key":"桂林","isLeaf":true},{"name":"梧州","parent_id":"广西","level":2,"id":"梧州","title":"梧州","key":"梧州","isLeaf":true},{"name":"北海","parent_id":"广西","level":2,"id":"北海","title":"北海","key":"北海","isLeaf":true},{"name":"防城港","parent_id":"广西","level":2,"id":"防城港","title":"防城港","key":"防城港","isLeaf":true},{"name":"钦州","parent_id":"广西","level":2,"id":"钦州","title":"钦州","key":"钦州","isLeaf":true},{"name":"贵港","parent_id":"广西","level":2,"id":"贵港","title":"贵港","key":"贵港","isLeaf":true},{"name":"玉林","parent_id":"广西","level":2,"id":"玉林","title":"玉林","key":"玉林","isLeaf":true},{"name":"百色","parent_id":"广西","level":2,"id":"百色","title":"百色","key":"百色","isLeaf":true},{"name":"贺州","parent_id":"广西","level":2,"id":"贺州","title":"贺州","key":"贺州","isLeaf":true},{"name":"河池","parent_id":"广西","level":2,"id":"河池","title":"河池","key":"河池","isLeaf":true},{"name":"来宾","parent_id":"广西","level":2,"id":"来宾","title":"来宾","key":"来宾","isLeaf":true},{"name":"崇左","parent_id":"广西","level":2,"id":"崇左","title":"崇左","key":"崇左","isLeaf":true}],"level":1,"id":"广西","title":"广西","key":"广西","parent_id":"all","isLeaf":false},{"name":"海南","children":[{"name":"海口","parent_id":"海南省","level":2,"id":"海口","title":"海口","key":"海口","isLeaf":true},{"name":"三亚","parent_id":"海南省","level":2,"id":"三亚","title":"三亚","key":"三亚","isLeaf":true},{"name":"三沙","parent_id":"海南省","level":2,"id":"三沙","title":"三沙","key":"三沙","isLeaf":true},{"name":"五指山","parent_id":"海南省","level":2,"id":"五指山","title":"五指山","key":"五指山","isLeaf":true},{"name":"琼海","parent_id":"海南省","level":2,"id":"琼海","title":"琼海","key":"琼海","isLeaf":true},{"name":"儋州","parent_id":"海南省","level":2,"id":"儋州","title":"儋州","key":"儋州","isLeaf":true},{"name":"文昌","parent_id":"海南省","level":2,"id":"文昌","title":"文昌","key":"文昌","isLeaf":true},{"name":"万宁","parent_id":"海南省","level":2,"id":"万宁","title":"万宁","key":"万宁","isLeaf":true},{"name":"东方","parent_id":"海南省","level":2,"id":"东方","title":"东方","key":"东方","isLeaf":true},{"name":"定安","parent_id":"海南省","level":2,"id":"定安","title":"定安","key":"定安","isLeaf":true},{"name":"屯昌","parent_id":"海南省","level":2,"id":"屯昌","title":"屯昌","key":"屯昌","isLeaf":true},{"name":"澄迈","parent_id":"海南省","level":2,"id":"澄迈","title":"澄迈","key":"澄迈","isLeaf":true},{"name":"临高","parent_id":"海南省","level":2,"id":"临高","title":"临高","key":"临高","isLeaf":true},{"name":"白沙","parent_id":"海南省","level":2,"id":"白沙","title":"白沙","key":"白沙","isLeaf":true},{"name":"昌江","parent_id":"海南省","level":2,"id":"昌江","title":"昌江","key":"昌江","isLeaf":true},{"name":"乐东","parent_id":"海南省","level":2,"id":"乐东","title":"乐东","key":"乐东","isLeaf":true},{"name":"陵水","parent_id":"海南省","level":2,"id":"陵水","title":"陵水","key":"陵水","isLeaf":true},{"name":"保亭","parent_id":"海南省","level":2,"id":"保亭","title":"保亭","key":"保亭","isLeaf":true},{"name":"琼中","parent_id":"海南省","level":2,"id":"琼中","title":"琼中","key":"琼中","isLeaf":true}],"level":1,"id":"海南省","title":"海南","key":"海南省","parent_id":"all","isLeaf":false},{"name":"四川","children":[{"name":"成都","parent_id":"四川","level":2,"id":"成都","title":"成都","key":"成都","isLeaf":true},{"name":"自贡","parent_id":"四川","level":2,"id":"自贡","title":"自贡","key":"自贡","isLeaf":true},{"name":"攀枝花","parent_id":"四川","level":2,"id":"攀枝花","title":"攀枝花","key":"攀枝花","isLeaf":true},{"name":"泸州","parent_id":"四川","level":2,"id":"泸州","title":"泸州","key":"泸州","isLeaf":true},{"name":"德阳","parent_id":"四川","level":2,"id":"德阳","title":"德阳","key":"德阳","isLeaf":true},{"name":"绵阳","parent_id":"四川","level":2,"id":"绵阳","title":"绵阳","key":"绵阳","isLeaf":true},{"name":"广元","parent_id":"四川","level":2,"id":"广元","title":"广元","key":"广元","isLeaf":true},{"name":"遂宁","parent_id":"四川","level":2,"id":"遂宁","title":"遂宁","key":"遂宁","isLeaf":true},{"name":"内江","parent_id":"四川","level":2,"id":"内江","title":"内江","key":"内江","isLeaf":true},{"name":"乐山","parent_id":"四川","level":2,"id":"乐山","title":"乐山","key":"乐山","isLeaf":true},{"name":"南充","parent_id":"四川","level":2,"id":"南充","title":"南充","key":"南充","isLeaf":true},{"name":"眉山","parent_id":"四川","level":2,"id":"眉山","title":"眉山","key":"眉山","isLeaf":true},{"name":"宜宾","parent_id":"四川","level":2,"id":"宜宾","title":"宜宾","key":"宜宾","isLeaf":true},{"name":"广安","parent_id":"四川","level":2,"id":"广安","title":"广安","key":"广安","isLeaf":true},{"name":"达州","parent_id":"四川","level":2,"id":"达州","title":"达州","key":"达州","isLeaf":true},{"name":"雅安","parent_id":"四川","level":2,"id":"雅安","title":"雅安","key":"雅安","isLeaf":true},{"name":"巴中","parent_id":"四川","level":2,"id":"巴中","title":"巴中","key":"巴中","isLeaf":true},{"name":"资阳","parent_id":"四川","level":2,"id":"资阳","title":"资阳","key":"资阳","isLeaf":true},{"name":"阿坝","parent_id":"四川","level":2,"id":"阿坝","title":"阿坝","key":"阿坝","isLeaf":true},{"name":"甘孜","parent_id":"四川","level":2,"id":"甘孜","title":"甘孜","key":"甘孜","isLeaf":true},{"name":"凉山","parent_id":"四川","level":2,"id":"凉山","title":"凉山","key":"凉山","isLeaf":true}],"level":1,"id":"四川","title":"四川","key":"四川","parent_id":"all","isLeaf":false},{"name":"贵州","children":[{"name":"贵阳","parent_id":"贵州","level":2,"id":"贵阳","title":"贵阳","key":"贵阳","isLeaf":true},{"name":"六盘水","parent_id":"贵州","level":2,"id":"六盘水","title":"六盘水","key":"六盘水","isLeaf":true},{"name":"遵义","parent_id":"贵州","level":2,"id":"遵义","title":"遵义","key":"遵义","isLeaf":true},{"name":"安顺","parent_id":"贵州","level":2,"id":"安顺","title":"安顺","key":"安顺","isLeaf":true},{"name":"毕节","parent_id":"贵州","level":2,"id":"毕节","title":"毕节","key":"毕节","isLeaf":true},{"name":"铜仁","parent_id":"贵州","level":2,"id":"铜仁","title":"铜仁","key":"铜仁","isLeaf":true},{"name":"黔西南","parent_id":"贵州","level":2,"id":"黔西南","title":"黔西南","key":"黔西南","isLeaf":true},{"name":"黔东南","parent_id":"贵州","level":2,"id":"黔东南","title":"黔东南","key":"黔东南","isLeaf":true},{"name":"黔南","parent_id":"贵州","level":2,"id":"黔南","title":"黔南","key":"黔南","isLeaf":true}],"level":1,"id":"贵州","title":"贵州","key":"贵州","parent_id":"all","isLeaf":false},{"name":"云南","children":[{"name":"昆明","parent_id":"云南","level":2,"id":"昆明","title":"昆明","key":"昆明","isLeaf":true},{"name":"曲靖","parent_id":"云南","level":2,"id":"曲靖","title":"曲靖","key":"曲靖","isLeaf":true},{"name":"玉溪","parent_id":"云南","level":2,"id":"玉溪","title":"玉溪","key":"玉溪","isLeaf":true},{"name":"昭通","parent_id":"云南","level":2,"id":"昭通","title":"昭通","key":"昭通","isLeaf":true},{"name":"丽江","parent_id":"云南","level":2,"id":"丽江","title":"丽江","key":"丽江","isLeaf":true},{"name":"普洱","parent_id":"云南","level":2,"id":"普洱","title":"普洱","key":"普洱","isLeaf":true},{"name":"临沧","parent_id":"云南","level":2,"id":"临沧","title":"临沧","key":"临沧","isLeaf":true},{"name":"楚雄","parent_id":"云南","level":2,"id":"楚雄","title":"楚雄","key":"楚雄","isLeaf":true},{"name":"红河","parent_id":"云南","level":2,"id":"红河","title":"红河","key":"红河","isLeaf":true},{"name":"文山","parent_id":"云南","level":2,"id":"文山","title":"文山","key":"文山","isLeaf":true},{"name":"西双版纳","parent_id":"云南","level":2,"id":"西双版纳","title":"西双版纳","key":"西双版纳","isLeaf":true},{"name":"大理","parent_id":"云南","level":2,"id":"大理","title":"大理","key":"大理","isLeaf":true},{"name":"德宏","parent_id":"云南","level":2,"id":"德宏","title":"德宏","key":"德宏","isLeaf":true},{"name":"怒江","parent_id":"云南","level":2,"id":"怒江","title":"怒江","key":"怒江","isLeaf":true},{"name":"迪庆","parent_id":"云南","level":2,"id":"迪庆","title":"迪庆","key":"迪庆","isLeaf":true},{"name":"保山","parent_id":"云南","level":2,"id":"保山","title":"保山","key":"保山","isLeaf":true}],"level":1,"id":"云南","title":"云南","key":"云南","parent_id":"all","isLeaf":false},{"name":"西藏","children":[{"name":"拉萨","parent_id":"西藏","level":2,"id":"拉萨","title":"拉萨","key":"拉萨","isLeaf":true},{"name":"昌都","parent_id":"西藏","level":2,"id":"昌都","title":"昌都","key":"昌都","isLeaf":true},{"name":"山南","parent_id":"西藏","level":2,"id":"山南","title":"山南","key":"山南","isLeaf":true},{"name":"日喀则","parent_id":"西藏","level":2,"id":"日喀则","title":"日喀则","key":"日喀则","isLeaf":true},{"name":"那曲","parent_id":"西藏","level":2,"id":"那曲","title":"那曲","key":"那曲","isLeaf":true},{"name":"阿里","parent_id":"西藏","level":2,"id":"阿里","title":"阿里","key":"阿里","isLeaf":true},{"name":"林芝","parent_id":"西藏","level":2,"id":"林芝","title":"林芝","key":"林芝","isLeaf":true}],"level":1,"id":"西藏","title":"西藏","key":"西藏","parent_id":"all","isLeaf":false},{"name":"陕西","children":[{"name":"西安","parent_id":"陕西","level":2,"id":"西安","title":"西安","key":"西安","isLeaf":true},{"name":"铜川","parent_id":"陕西","level":2,"id":"铜川","title":"铜川","key":"铜川","isLeaf":true},{"name":"宝鸡","parent_id":"陕西","level":2,"id":"宝鸡","title":"宝鸡","key":"宝鸡","isLeaf":true},{"name":"咸阳","parent_id":"陕西","level":2,"id":"咸阳","title":"咸阳","key":"咸阳","isLeaf":true},{"name":"渭南","parent_id":"陕西","level":2,"id":"渭南","title":"渭南","key":"渭南","isLeaf":true},{"name":"延安","parent_id":"陕西","level":2,"id":"延安","title":"延安","key":"延安","isLeaf":true},{"name":"汉中","parent_id":"陕西","level":2,"id":"汉中","title":"汉中","key":"汉中","isLeaf":true},{"name":"榆林","parent_id":"陕西","level":2,"id":"榆林","title":"榆林","key":"榆林","isLeaf":true},{"name":"安康","parent_id":"陕西","level":2,"id":"安康","title":"安康","key":"安康","isLeaf":true},{"name":"商洛","parent_id":"陕西","level":2,"id":"商洛","title":"商洛","key":"商洛","isLeaf":true}],"level":1,"id":"陕西","title":"陕西","key":"陕西","parent_id":"all","isLeaf":false},{"name":"甘肃","children":[{"name":"兰州","parent_id":"甘肃","level":2,"id":"兰州","title":"兰州","key":"兰州","isLeaf":true},{"name":"嘉峪关","parent_id":"甘肃","level":2,"id":"嘉峪关","title":"嘉峪关","key":"嘉峪关","isLeaf":true},{"name":"金昌","parent_id":"甘肃","level":2,"id":"金昌","title":"金昌","key":"金昌","isLeaf":true},{"name":"白银","parent_id":"甘肃","level":2,"id":"白银","title":"白银","key":"白银","isLeaf":true},{"name":"天水","parent_id":"甘肃","level":2,"id":"天水","title":"天水","key":"天水","isLeaf":true},{"name":"武威","parent_id":"甘肃","level":2,"id":"武威","title":"武威","key":"武威","isLeaf":true},{"name":"张掖","parent_id":"甘肃","level":2,"id":"张掖","title":"张掖","key":"张掖","isLeaf":true},{"name":"平凉","parent_id":"甘肃","level":2,"id":"平凉","title":"平凉","key":"平凉","isLeaf":true},{"name":"酒泉","parent_id":"甘肃","level":2,"id":"酒泉","title":"酒泉","key":"酒泉","isLeaf":true},{"name":"庆阳","parent_id":"甘肃","level":2,"id":"庆阳","title":"庆阳","key":"庆阳","isLeaf":true},{"name":"定西","parent_id":"甘肃","level":2,"id":"定西","title":"定西","key":"定西","isLeaf":true},{"name":"陇南","parent_id":"甘肃","level":2,"id":"陇南","title":"陇南","key":"陇南","isLeaf":true},{"name":"临夏","parent_id":"甘肃","level":2,"id":"临夏","title":"临夏","key":"临夏","isLeaf":true},{"name":"甘南","parent_id":"甘肃","level":2,"id":"甘南","title":"甘南","key":"甘南","isLeaf":true}],"level":1,"id":"甘肃","title":"甘肃","key":"甘肃","parent_id":"all","isLeaf":false},{"name":"青海","children":[{"name":"西宁","parent_id":"青海","level":2,"id":"西宁","title":"西宁","key":"西宁","isLeaf":true},{"name":"海东","parent_id":"青海","level":2,"id":"海东","title":"海东","key":"海东","isLeaf":true},{"name":"海北","parent_id":"青海","level":2,"id":"海北","title":"海北","key":"海北","isLeaf":true},{"name":"黄南","parent_id":"青海","level":2,"id":"黄南","title":"黄南","key":"黄南","isLeaf":true},{"name":"海南","parent_id":"青海","level":2,"id":"海南","title":"海南","key":"海南","isLeaf":true},{"name":"果洛","parent_id":"青海","level":2,"id":"果洛","title":"果洛","key":"果洛","isLeaf":true},{"name":"玉树","parent_id":"青海","level":2,"id":"玉树","title":"玉树","key":"玉树","isLeaf":true},{"name":"海西","parent_id":"青海","level":2,"id":"海西","title":"海西","key":"海西","isLeaf":true}],"level":1,"id":"青海","title":"青海","key":"青海","parent_id":"all","isLeaf":false},{"name":"宁夏","children":[{"name":"银川","parent_id":"宁夏","level":2,"id":"银川","title":"银川","key":"银川","isLeaf":true},{"name":"石嘴山","parent_id":"宁夏","level":2,"id":"石嘴山","title":"石嘴山","key":"石嘴山","isLeaf":true},{"name":"吴忠","parent_id":"宁夏","level":2,"id":"吴忠","title":"吴忠","key":"吴忠","isLeaf":true},{"name":"固原","parent_id":"宁夏","level":2,"id":"固原","title":"固原","key":"固原","isLeaf":true},{"name":"中卫","parent_id":"宁夏","level":2,"id":"中卫","title":"中卫","key":"中卫","isLeaf":true}],"level":1,"id":"宁夏","title":"宁夏","key":"宁夏","parent_id":"all","isLeaf":false},{"name":"新疆","children":[{"name":"乌鲁木齐","parent_id":"新疆","level":2,"id":"乌鲁木齐","title":"乌鲁木齐","key":"乌鲁木齐","isLeaf":true},{"name":"克拉玛依","parent_id":"新疆","level":2,"id":"克拉玛依","title":"克拉玛依","key":"克拉玛依","isLeaf":true},{"name":"吐鲁番","parent_id":"新疆","level":2,"id":"吐鲁番","title":"吐鲁番","key":"吐鲁番","isLeaf":true},{"name":"哈密","parent_id":"新疆","level":2,"id":"哈密","title":"哈密","key":"哈密","isLeaf":true},{"name":"昌吉","parent_id":"新疆","level":2,"id":"昌吉","title":"昌吉","key":"昌吉","isLeaf":true},{"name":"博尔塔拉","parent_id":"新疆","level":2,"id":"博尔塔拉","title":"博尔塔拉","key":"博尔塔拉","isLeaf":true},{"name":"巴音郭楞","parent_id":"新疆","level":2,"id":"巴音郭楞","title":"巴音郭楞","key":"巴音郭楞","isLeaf":true},{"name":"阿克苏","parent_id":"新疆","level":2,"id":"阿克苏","title":"阿克苏","key":"阿克苏","isLeaf":true},{"name":"克孜勒苏","parent_id":"新疆","level":2,"id":"克孜勒苏","title":"克孜勒苏","key":"克孜勒苏","isLeaf":true},{"name":"喀什","parent_id":"新疆","level":2,"id":"喀什","title":"喀什","key":"喀什","isLeaf":true},{"name":"和田","parent_id":"新疆","level":2,"id":"和田","title":"和田","key":"和田","isLeaf":true},{"name":"伊犁","parent_id":"新疆","level":2,"id":"伊犁","title":"伊犁","key":"伊犁","isLeaf":true},{"name":"塔城","parent_id":"新疆","level":2,"id":"塔城","title":"塔城","key":"塔城","isLeaf":true},{"name":"阿勒泰","parent_id":"新疆","level":2,"id":"阿勒泰","title":"阿勒泰","key":"阿勒泰","isLeaf":true},{"name":"石河子","parent_id":"新疆","level":2,"id":"石河子","title":"石河子","key":"石河子","isLeaf":true},{"name":"阿拉尔","parent_id":"新疆","level":2,"id":"阿拉尔","title":"阿拉尔","key":"阿拉尔","isLeaf":true},{"name":"图木舒克","parent_id":"新疆","level":2,"id":"图木舒克","title":"图木舒克","key":"图木舒克","isLeaf":true},{"name":"五家渠","parent_id":"新疆","level":2,"id":"五家渠","title":"五家渠","key":"五家渠","isLeaf":true},{"name":"北屯","parent_id":"新疆","level":2,"id":"北屯","title":"北屯","key":"北屯","isLeaf":true},{"name":"铁门关","parent_id":"新疆","level":2,"id":"铁门关","title":"铁门关","key":"铁门关","isLeaf":true},{"name":"双河","parent_id":"新疆","level":2,"id":"双河","title":"双河","key":"双河","isLeaf":true},{"name":"可克达拉","parent_id":"新疆","level":2,"id":"可克达拉","title":"可克达拉","key":"可克达拉","isLeaf":true},{"name":"昆玉","parent_id":"新疆","level":2,"id":"昆玉","title":"昆玉","key":"昆玉","isLeaf":true}],"level":1,"id":"新疆","title":"新疆","key":"新疆","parent_id":"all","isLeaf":false},{"name":"台湾","level":1,"id":"台湾","title":"台湾","key":"台湾","parent_id":"all","isLeaf":true},{"name":"香港","level":1,"id":"香港","title":"香港","key":"香港","parent_id":"all","isLeaf":true},{"name":"澳门","level":1,"id":"澳门","title":"澳门","key":"澳门","parent_id":"all","isLeaf":true}]}];
   private region_lists = [
     {
       "code": "9010000",
       "name": "北京",
       "sub": [],
       "region": "North",
       "order": 1
     },
     {
       "code": "9020000",
       "name": "天津",
       "sub": [],
       "region": "North",
       "order": 2
     },
     {
       "code": "9030000",
       "name": "河北",
       "sub": [
         {
           "code": "9030100",
           "name": "石家庄"
         },
         {
           "code": "9030200",
           "name": "唐山"
         },
         {
           "code": "9030300",
           "name": "秦皇岛"
         },
         {
           "code": "9030400",
           "name": "邯郸"
         },
         {
           "code": "9030500",
           "name": "邢台"
         },
         {
           "code": "9030600",
           "name": "保定"
         },
         {
           "code": "9030700",
           "name": "张家口"
         },
         {
           "code": "9030800",
           "name": "承德"
         },
         {
           "code": "9030900",
           "name": "沧州"
         },
         {
           "code": "9031000",
           "name": "廊坊"
         },
         {
           "code": "9031100",
           "name": "衡水"
         }
       ],
       "region": "North",
       "order": 3
     },
     {
       "code": "9040000",
       "name": "山西",
       "sub": [
         {
           "code": "9040100",
           "name": "太原"
         },
         {
           "code": "9040200",
           "name": "大同"
         },
         {
           "code": "9040300",
           "name": "阳泉"
         },
         {
           "code": "9040400",
           "name": "长治"
         },
         {
           "code": "9040500",
           "name": "晋城"
         },
         {
           "code": "9040600",
           "name": "朔州"
         },
         {
           "code": "9040700",
           "name": "晋中"
         },
         {
           "code": "9040800",
           "name": "运城"
         },
         {
           "code": "9040900",
           "name": "忻州"
         },
         {
           "code": "9041000",
           "name": "临汾"
         },
         {
           "code": "9041100",
           "name": "吕梁"
         }
       ],
       "region": "North",
       "order": 4
     },
     {
       "code": "9050000",
       "name": "内蒙古",
       "sub": [
         {
           "code": "9050100",
           "name": "呼和浩特"
         },
         {
           "code": "9050200",
           "name": "包头"
         },
         {
           "code": "9050600",
           "name": "鄂尔多斯"
         },
         {
           "code": "9050300",
           "name": "乌海"
         },
         {
           "code": "9050400",
           "name": "赤峰"
         },
         {
           "code": "9051100",
           "name": "锡林郭勒盟"
         },
         {
           "code": "9050500",
           "name": "通辽"
         },
         {
           "code": "9050700",
           "name": "呼伦贝尔"
         },
         {
           "code": "9050800",
           "name": "巴彦淖尔"
         },
         {
           "code": "9050900",
           "name": "乌兰察布"
         },
         {
           "code": "9051000",
           "name": "兴安盟"
         },
         {
           "code": "9051200",
           "name": "阿拉善盟"
         }
       ],
       "region": "North",
       "order": 5
     },
     {
       "code": "9060000",
       "name": "辽宁",
       "sub": [
         {
           "code": "9060100",
           "name": "沈阳"
         },
         {
           "code": "9060200",
           "name": "大连"
         },
         {
           "code": "9060300",
           "name": "鞍山"
         },
         {
           "code": "9060400",
           "name": "抚顺"
         },
         {
           "code": "9060500",
           "name": "本溪"
         },
         {
           "code": "9060600",
           "name": "丹东"
         },
         {
           "code": "9060700",
           "name": "锦州"
         },
         {
           "code": "9060800",
           "name": "营口"
         },
         {
           "code": "9060900",
           "name": "阜新"
         },
         {
           "code": "9061000",
           "name": "辽阳"
         },
         {
           "code": "9061100",
           "name": "盘锦"
         },
         {
           "code": "9061200",
           "name": "铁岭"
         },
         {
           "code": "9061300",
           "name": "朝阳"
         },
         {
           "code": "9061400",
           "name": "葫芦岛"
         }
       ],
       "region": "Northeast",
       "is_north_east": true,
       "order": 1
     },
     {
       "code": "9070000",
       "name": "吉林",
       "sub": [
         {
           "code": "9070100",
           "name": "长春"
         },
         {
           "code": "9070200",
           "name": "吉林"
         },
         {
           "code": "9070300",
           "name": "四平"
         },
         {
           "code": "9070400",
           "name": "辽源"
         },
         {
           "code": "9070500",
           "name": "通化"
         },
         {
           "code": "9070600",
           "name": "白山"
         },
         {
           "code": "9070700",
           "name": "延边"
         },
         {
           "code": "9070800",
           "name": "白城"
         },
         {
           "code": "9070700",
           "name": "松原"
         }
       ],
       "region": "Northeast",
       "order": 2
     },
     {
       "code": "9080000",
       "name": "黑龙江",
       "sub": [
         {
           "code": "9080100",
           "name": "哈尔滨"
         },
         {
           "code": "9080200",
           "name": "齐齐哈尔"
         },
         {
           "code": "9080300",
           "name": "鸡西"
         },
         {
           "code": "9080400",
           "name": "鹤岗"
         },
         {
           "code": "9080500",
           "name": "双鸭山"
         },
         {
           "code": "9080600",
           "name": "大庆"
         },
         {
           "code": "9080700",
           "name": "伊春"
         },
         {
           "code": "9080800",
           "name": "佳木斯"
         },
         {
           "code": "9080900",
           "name": "七台河"
         },
         {
           "code": "9081000",
           "name": "牡丹江"
         },
         {
           "code": "9081100",
           "name": "黑河"
         },
         {
           "code": "9081200",
           "name": "绥化"
         },
         {
           "code": "9081300",
           "name": "大兴安岭"
         }
       ],
       "region": "Northeast",
       "order": 3
     },
     {
       "code": "9090000",
       "name": "上海",
       "sub": [],
       "region": "East",
       "order": 1
     },
     {
       "code": "9100000",
       "name": "江苏",
       "sub": [
         {
           "code": "9100100",
           "name": "南京"
         },
         {
           "code": "9100200",
           "name": "无锡"
         },
         {
           "code": "9100300",
           "name": "徐州"
         },
         {
           "code": "9100400",
           "name": "常州"
         },
         {
           "code": "9100500",
           "name": "苏州"
         },
         {
           "code": "9100600",
           "name": "南通"
         },
         {
           "code": "9100700",
           "name": "连云港"
         },
         {
           "code": "9100800",
           "name": "淮安"
         },
         {
           "code": "9100900",
           "name": "盐城"
         },
         {
           "code": "9101000",
           "name": "扬州"
         },
         {
           "code": "9101100",
           "name": "镇江"
         },
         {
           "code": "9101200",
           "name": "泰州"
         },
         {
           "code": "9101300",
           "name": "宿迁"
         }
       ],
       "region": "East",
       "order": 2
     },
     {
       "code": "9110000",
       "name": "浙江",
       "sub": [
         {
           "code": "9110100",
           "name": "杭州"
         },
         {
           "code": "9110200",
           "name": "宁波"
         },
         {
           "code": "9110300",
           "name": "温州"
         },
         {
           "code": "9110400",
           "name": "嘉兴"
         },
         {
           "code": "9110500",
           "name": "湖州"
         },
         {
           "code": "9110600",
           "name": "绍兴"
         },
         {
           "code": "9110700",
           "name": "金华"
         },
         {
           "code": "9110800",
           "name": "衢州"
         },
         {
           "code": "9110900",
           "name": "舟山"
         },
         {
           "code": "9111000",
           "name": "台州"
         },
         {
           "code": "9111100",
           "name": "丽水"
         }
       ],
       "region": "East",
       "order": 3
     },
     {
       "code": "9120000",
       "name": "安徽",
       "sub": [
         {
           "code": "9120100",
           "name": "合肥"
         },
         {
           "code": "9120109",
           "name": "巢湖"
         },
         {
           "code": "9120200",
           "name": "芜湖"
         },
         {
           "code": "9120300",
           "name": "蚌埠"
         },
         {
           "code": "9120400",
           "name": "淮南"
         },
         {
           "code": "9120500",
           "name": "马鞍山"
         },
         {
           "code": "9120600",
           "name": "淮北"
         },
         {
           "code": "9120700",
           "name": "铜陵"
         },
         {
           "code": "9120800",
           "name": "安庆"
         },
         {
           "code": "9120900",
           "name": "黄山"
         },
         {
           "code": "9121000",
           "name": "滁州"
         },
         {
           "code": "9121100",
           "name": "阜阳"
         },
         {
           "code": "9121200",
           "name": "宿州"
         },
         {
           "code": "9121300",
           "name": "六安"
         },
         {
           "code": "9121400",
           "name": "亳州"
         },
         {
           "code": "9121500",
           "name": "池州"
         },
         {
           "code": "9121600",
           "name": "宣城"
         }
       ],
       "region": "East",
       "order": 4
     },
     {
       "code": "9130000",
       "name": "福建",
       "sub": [
         {
           "code": "9130100",
           "name": "福州"
         },
         {
           "code": "9130200",
           "name": "厦门"
         },
         {
           "code": "9130300",
           "name": "莆田"
         },
         {
           "code": "9130400",
           "name": "三明"
         },
         {
           "code": "9130500",
           "name": "泉州"
         },
         {
           "code": "9130600",
           "name": "漳州"
         },
         {
           "code": "9130700",
           "name": "南平"
         },
         {
           "code": "9130800",
           "name": "龙岩"
         },
         {
           "code": "9130900",
           "name": "宁德"
         }
       ],
       "region": "East",
       "order": 5
     },
     {
       "code": "9140000",
       "name": "江西",
       "sub": [
         {
           "code": "9140100",
           "name": "南昌"
         },
         {
           "code": "9140200",
           "name": "景德镇"
         },
         {
           "code": "9140300",
           "name": "萍乡"
         },
         {
           "code": "9140400",
           "name": "九江"
         },
         {
           "code": "9140500",
           "name": "新余"
         },
         {
           "code": "9140600",
           "name": "鹰潭"
         },
         {
           "code": "9140700",
           "name": "赣州"
         },
         {
           "code": "9140800",
           "name": "吉安"
         },
         {
           "code": "9140900",
           "name": "宜春"
         },
         {
           "code": "9141000",
           "name": "抚州"
         },
         {
           "code": "9141100",
           "name": "上饶"
         }
       ],
       "region": "East",
       "order": 6
     },
     {
       "code": "9150000",
       "name": "山东",
       "sub": [
         {
           "code": "9150100",
           "name": "济南"
         },
         {
           "code": "9150200",
           "name": "青岛"
         },
         {
           "code": "9150300",
           "name": "淄博"
         },
         {
           "code": "9150400",
           "name": "枣庄"
         },
         {
           "code": "9150500",
           "name": "东营"
         },
         {
           "code": "9150600",
           "name": "烟台"
         },
         {
           "code": "9150700",
           "name": "潍坊"
         },
         {
           "code": "9150800",
           "name": "济宁"
         },
         {
           "code": "9150900",
           "name": "泰安"
         },
         {
           "code": "9151000",
           "name": "威海"
         },
         {
           "code": "9151100",
           "name": "日照"
         },
         {
           "code": "9151200",
           "name": "莱芜"
         },
         {
           "code": "9151300",
           "name": "临沂"
         },
         {
           "code": "9151400",
           "name": "德州"
         },
         {
           "code": "9151500",
           "name": "聊城"
         },
         {
           "code": "9151600",
           "name": "滨州"
         },
         {
           "code": "9151700",
           "name": "菏泽"
         }
       ],
       "region": "East",
       "order": 7
     },
     {
       "code": "9160000",
       "name": "河南",
       "sub": [
         {
           "code": "9160100",
           "name": "郑州"
         },
         {
           "code": "9160200",
           "name": "开封"
         },
         {
           "code": "9160300",
           "name": "洛阳"
         },
         {
           "code": "9160400",
           "name": "平顶山"
         },
         {
           "code": "9160500",
           "name": "安阳"
         },
         {
           "code": "9160600",
           "name": "鹤壁"
         },
         {
           "code": "9160700",
           "name": "新乡"
         },
         {
           "code": "9160800",
           "name": "焦作"
         },
         {
           "code": "9160900",
           "name": "濮阳"
         },
         {
           "code": "9161000",
           "name": "许昌"
         },
         {
           "code": "9161100",
           "name": "漯河"
         },
         {
           "code": "9161200",
           "name": "三门峡"
         },
         {
           "code": "9161300",
           "name": "南阳"
         },
         {
           "code": "9161400",
           "name": "商丘"
         },
         {
           "code": "9161500",
           "name": "信阳"
         },
         {
           "code": "9161600",
           "name": "周口"
         },
         {
           "code": "9161700",
           "name": "驻马店"
         },
         {
           "code": "9161801",
           "name": "济源"
         }
       ],
       "region": "Central",
       "order": 1
     },
     {
       "code": "9170000",
       "name": "湖北",
       "sub": [
         {
           "code": "9170100",
           "name": "武汉"
         },
         {
           "code": "9170200",
           "name": "黄石"
         },
         {
           "code": "9170300",
           "name": "十堰"
         },
         {
           "code": "9170400",
           "name": "宜昌"
         },
         {
           "code": "9170500",
           "name": "襄阳"
         },
         {
           "code": "9170600",
           "name": "鄂州"
         },
         {
           "code": "9170700",
           "name": "荆门"
         },
         {
           "code": "9170800",
           "name": "孝感"
         },
         {
           "code": "9170900",
           "name": "荆州"
         },
         {
           "code": "9171000",
           "name": "黄冈"
         },
         {
           "code": "9171100",
           "name": "咸宁"
         },
         {
           "code": "9171200",
           "name": "随州"
         },
         {
           "code": "9171300",
           "name": "恩施"
         },
         {
           "code": "9171401",
           "name": "仙桃"
         },
         {
           "code": "9171402",
           "name": "潜江"
         },
         {
           "code": "9171403",
           "name": "天门"
         },
         {
           "code": "9171404",
           "name": "神农架"
         }
       ],
       "region": "Central",
       "order": 2
     },
     {
       "code": "9180000",
       "name": "湖南",
       "sub": [
         {
           "code": "9180100",
           "name": "长沙"
         },
         {
           "code": "9180200",
           "name": "株洲"
         },
         {
           "code": "9180300",
           "name": "湘潭"
         },
         {
           "code": "9180400",
           "name": "衡阳"
         },
         {
           "code": "9180500",
           "name": "邵阳"
         },
         {
           "code": "9180600",
           "name": "岳阳"
         },
         {
           "code": "9180700",
           "name": "常德"
         },
         {
           "code": "9180800",
           "name": "张家界"
         },
         {
           "code": "9180900",
           "name": "益阳"
         },
         {
           "code": "9181000",
           "name": "郴州"
         },
         {
           "code": "9181100",
           "name": "永州"
         },
         {
           "code": "9181200",
           "name": "怀化"
         },
         {
           "code": "9181300",
           "name": "娄底"
         },
         {
           "code": "9181400",
           "name": "湘西"
         }
       ],
       "region": "Central",
       "order": 3
     },
     {
       "code": "9190000",
       "name": "广东",
       "sub": [
         {
           "code": "9190100",
           "name": "广州"
         },
         {
           "code": "9190200",
           "name": "韶关"
         },
         {
           "code": "9190300",
           "name": "深圳"
         },
         {
           "code": "9190400",
           "name": "珠海"
         },
         {
           "code": "9190500",
           "name": "汕头"
         },
         {
           "code": "9190600",
           "name": "佛山"
         },
         {
           "code": "9190700",
           "name": "江门"
         },
         {
           "code": "9190800",
           "name": "湛江"
         },
         {
           "code": "9190900",
           "name": "茂名"
         },
         {
           "code": "9191000",
           "name": "肇庆"
         },
         {
           "code": "9191100",
           "name": "惠州"
         },
         {
           "code": "9191200",
           "name": "梅州"
         },
         {
           "code": "9191300",
           "name": "汕尾"
         },
         {
           "code": "9191400",
           "name": "河源"
         },
         {
           "code": "9191500",
           "name": "阳江"
         },
         {
           "code": "9191600",
           "name": "清远"
         },
         {
           "code": "9191700",
           "name": "东莞"
         },
         {
           "code": "9191800",
           "name": "中山"
         },
         {
           "code": "9191900",
           "name": "潮州"
         },
         {
           "code": "9192000",
           "name": "揭阳"
         },
         {
           "code": "9192100",
           "name": "云浮"
         }
       ],
       "region": "South",
       "order": 1
     },
     {
       "code": "9210000",
       "name": "海南",
       "sub": [
         {
           "code": "9210100",
           "name": "海口"
         },
         {
           "code": "9210200",
           "name": "三亚"
         },
         {
           "code": "9210411",
           "name": "白沙黎族自治县"
         },
         {
           "code": "9210401",
           "name": "五指山"
         },
         {
           "code": "9210402",
           "name": "琼海"
         },
         {
           "code": "9210412",
           "name": "昌江黎族自治县"
         },
         {
           "code": "9210403",
           "name": "儋州"
         },
         {
           "code": "9210404",
           "name": "文昌"
         },
         {
           "code": "9210413",
           "name": "乐东黎族自治县"
         },
         {
           "code": "9210405",
           "name": "万宁"
         },
         {
           "code": "9210406",
           "name": "东方"
         },
         {
           "code": "9210414",
           "name": "陵水黎族自治县"
         },
         {
           "code": "9210407",
           "name": "定安县"
         },
         {
           "code": "9210408",
           "name": "屯昌县"
         },
         {
           "code": "9210415",
           "name": "保亭黎族苗族自治县"
         },
         {
           "code": "9210409",
           "name": "澄迈县"
         },
         {
           "code": "9210410",
           "name": "临高县"
         },
         {
           "code": "9210416",
           "name": "琼中黎族苗族自治县"
         },
         {
           "code": "9210300",
           "name": "三沙市"
         }
       ],
       "region": "South",
       "order": 2
     },
     {
       "code": "9200000",
       "name": "广西",
       "sub": [
         {
           "code": "9200100",
           "name": "南宁"
         },
         {
           "code": "9200200",
           "name": "柳州"
         },
         {
           "code": "9200300",
           "name": "桂林"
         },
         {
           "code": "9200400",
           "name": "梧州"
         },
         {
           "code": "9200500",
           "name": "北海"
         },
         {
           "code": "9200600",
           "name": "防城港"
         },
         {
           "code": "9200700",
           "name": "钦州"
         },
         {
           "code": "9200800",
           "name": "贵港"
         },
         {
           "code": "9200900",
           "name": "玉林"
         },
         {
           "code": "9201000",
           "name": "百色"
         },
         {
           "code": "9201100",
           "name": "贺州"
         },
         {
           "code": "9201200",
           "name": "河池"
         },
         {
           "code": "9201300",
           "name": "来宾"
         },
         {
           "code": "9201400",
           "name": "崇左"
         }
       ],
       "region": "South",
       "order": 3
     },
     {
       "code": "9220000",
       "name": "重庆",
       "sub": [],
       "region": "Southwest",
       "order": 1
     },
     {
       "code": "9230000",
       "name": "四川",
       "sub": [
         {
           "code": "9230100",
           "name": "成都"
         },
         {
           "code": "9230200",
           "name": "自贡"
         },
         {
           "code": "9230300",
           "name": "攀枝花"
         },
         {
           "code": "9230400",
           "name": "泸州"
         },
         {
           "code": "9230500",
           "name": "德阳"
         },
         {
           "code": "9230600",
           "name": "绵阳"
         },
         {
           "code": "9230700",
           "name": "广元"
         },
         {
           "code": "9230800",
           "name": "遂宁"
         },
         {
           "code": "9230900",
           "name": "内江"
         },
         {
           "code": "9231000",
           "name": "乐山"
         },
         {
           "code": "9231100",
           "name": "南充"
         },
         {
           "code": "9231200",
           "name": "眉山"
         },
         {
           "code": "9231300",
           "name": "宜宾"
         },
         {
           "code": "9231400",
           "name": "广安"
         },
         {
           "code": "9231500",
           "name": "达州"
         },
         {
           "code": "9231600",
           "name": "雅安"
         },
         {
           "code": "9231700",
           "name": "巴中"
         },
         {
           "code": "9231800",
           "name": "资阳"
         },
         {
           "code": "9231900",
           "name": "阿坝"
         },
         {
           "code": "9232000",
           "name": "甘孜"
         },
         {
           "code": "9232100",
           "name": "凉山"
         }
       ],
       "region": "Southwest",
       "order": 2
     },
     {
       "code": "9240000",
       "name": "贵州",
       "sub": [
         {
           "code": "9240100",
           "name": "贵阳"
         },
         {
           "code": "9240200",
           "name": "六盘水"
         },
         {
           "code": "9240300",
           "name": "遵义"
         },
         {
           "code": "9240400",
           "name": "安顺"
         },
         {
           "code": "9240500",
           "name": "毕节"
         },
         {
           "code": "9240600",
           "name": "铜仁"
         },
         {
           "code": "9240700",
           "name": "黔西南"
         },
         {
           "code": "9240800",
           "name": "黔东南"
         },
         {
           "code": "9240900",
           "name": "黔南"
         }
       ],
       "region": "Southwest",
       "order": 3
     },
     {
       "code": "9250000",
       "name": "云南",
       "sub": [
         {
           "code": "9250100",
           "name": "昆明"
         },
         {
           "code": "9250200",
           "name": "曲靖"
         },
         {
           "code": "9250300",
           "name": "玉溪"
         },
         {
           "code": "9250400",
           "name": "保山"
         },
         {
           "code": "9250500",
           "name": "昭通"
         },
         {
           "code": "9250600",
           "name": "丽江"
         },
         {
           "code": "9250700",
           "name": "普洱"
         },
         {
           "code": "9250800",
           "name": "临沧"
         },
         {
           "code": "9250900",
           "name": "楚雄"
         },
         {
           "code": "9251000",
           "name": "红河"
         },
         {
           "code": "9251100",
           "name": "文山"
         },
         {
           "code": "9251200",
           "name": "西双版纳"
         },
         {
           "code": "9251300",
           "name": "大理"
         },
         {
           "code": "9251400",
           "name": "德宏"
         },
         {
           "code": "9251500",
           "name": "怒江"
         },
         {
           "code": "9251600",
           "name": "迪庆"
         }
       ],
       "region": "Southwest",
       "order": 4
     },
     {
       "code": "9260000",
       "name": "西藏",
       "sub": [
         {
           "code": "9260100",
           "name": "拉萨"
         },
         {
           "code": "9260200",
           "name": "日喀则"
         },
         {
           "code": "9260300",
           "name": "昌都"
         },
         {
           "code": "9260400",
           "name": "山南"
         },
         {
           "code": "9260500",
           "name": "那曲"
         },
         {
           "code": "9260600",
           "name": "阿里"
         },
         {
           "code": "9260700",
           "name": "林芝"
         }
       ],
       "region": "Southwest",
       "order": 5
     },
     {
       "code": "9270000",
       "name": "陕西",
       "sub": [
         {
           "code": "9270100",
           "name": "西安"
         },
         {
           "code": "9270200",
           "name": "铜川"
         },
         {
           "code": "9270300",
           "name": "宝鸡"
         },
         {
           "code": "9270400",
           "name": "咸阳"
         },
         {
           "code": "9270500",
           "name": "渭南"
         },
         {
           "code": "9270600",
           "name": "延安"
         },
         {
           "code": "9270700",
           "name": "汉中"
         },
         {
           "code": "9270800",
           "name": "榆林"
         },
         {
           "code": "9270900",
           "name": "安康"
         },
         {
           "code": "9271000",
           "name": "商洛"
         }
       ],
       "region": "Northwest",
       "order": 1
     },
     {
       "code": "9280000",
       "name": "甘肃",
       "sub": [
         {
           "code": "9280100",
           "name": "兰州"
         },
         {
           "code": "9280200",
           "name": "嘉峪关"
         },
         {
           "code": "9280300",
           "name": "金昌"
         },
         {
           "code": "9280400",
           "name": "白银"
         },
         {
           "code": "9280500",
           "name": "天水"
         },
         {
           "code": "9280600",
           "name": "武威"
         },
         {
           "code": "9280700",
           "name": "张掖"
         },
         {
           "code": "9280800",
           "name": "平凉"
         },
         {
           "code": "9280900",
           "name": "酒泉"
         },
         {
           "code": "9281000",
           "name": "庆阳"
         },
         {
           "code": "9281100",
           "name": "定西"
         },
         {
           "code": "9281200",
           "name": "陇南"
         },
         {
           "code": "9281300",
           "name": "临夏"
         },
         {
           "code": "9281400",
           "name": "甘南"
         }
       ],
       "region": "Northwest",
       "order": 2
     },
     {
       "code": "9290000",
       "name": "青海",
       "sub": [
         {
           "code": "9290100",
           "name": "西宁"
         },
         {
           "code": "9290200",
           "name": "海东"
         },
         {
           "code": "9290300",
           "name": "海北"
         },
         {
           "code": "9290400",
           "name": "黄南"
         },
         {
           "code": "9290500",
           "name": "海南"
         },
         {
           "code": "9290600",
           "name": "果洛"
         },
         {
           "code": "9290700",
           "name": "玉树"
         },
         {
           "code": "9290800",
           "name": "海西"
         }
       ],
       "region": "Northwest",
       "order": 3
     },
     {
       "code": "9300000",
       "name": "宁夏",
       "sub": [
         {
           "code": "9300100",
           "name": "银川"
         },
         {
           "code": "9300200",
           "name": "石嘴山"
         },
         {
           "code": "9300300",
           "name": "吴忠"
         },
         {
           "code": "9300400",
           "name": "固原"
         },
         {
           "code": "9300500",
           "name": "中卫"
         }
       ],
       "region": "Northwest",
       "order": 4
     },
     {
       "code": "9310000",
       "name": "新疆",
       "sub": [
         {
           "code": "9310100",
           "name": "乌鲁木齐"
         },
         {
           "code": "9310400",
           "name": "哈密"
         },
         {
           "code": "9310300",
           "name": "吐鲁番"
         },
         {
           "code": "9310200",
           "name": "克拉玛依"
         },
         {
           "code": "9310500",
           "name": "昌吉"
         },
         {
           "code": "9311400",
           "name": "阿勒泰"
         },
         {
           "code": "9310600",
           "name": "博尔塔拉"
         },
         {
           "code": "9311200",
           "name": "伊犁"
         },
         {
           "code": "9310800",
           "name": "阿克苏"
         },
         {
           "code": "9310700",
           "name": "巴音郭楞"
         },
         {
           "code": "9311000",
           "name": "喀什"
         },
         {
           "code": "9310900",
           "name": "克孜勒苏柯尔克孜"
         },
         {
           "code": "9311503",
           "name": "图木舒克"
         },
         {
           "code": "9311100",
           "name": "和田"
         },
         {
           "code": "9311300",
           "name": "塔城"
         },
         {
           "code": "9311501",
           "name": "石河子"
         },
         {
           "code": "9311502",
           "name": "阿拉尔"
         },
         {
           "code": "9311504",
           "name": "五家渠"
         },
         {
           "code": "9311600",
           "name": "北屯"
         },
         {
           "code": "9311700",
           "name": "双河"
         },
         {
           "code": "9311800",
           "name": "可克达拉"
         },
         {
           "code": "9311900",
           "name": "昆玉"
         },
         {
           "code": "9312000",
           "name": "胡杨河"
         },
         {
           "code": "9312100",
           "name": "铁门关"
         }
       ],
       "region": "Northwest",
       "order": 5
     },
     {
       "code": "9330000",
       "name": "香港",
       "sub": [],
       "region": "Honkong",
       "order": 1
     },
     {
       "code": "9340000",
       "name": "澳门",
       "sub": [],
       "region": "Macao",
       "order": 2
     },
     {
       "code": "9320000",
       "name": "台湾",
       "sub": [],
       "region": "Taiwan",
       "order": 3
     },
     {
       "code": "12000000",
       "name": "日本",
       "sub": [],
       "region": "Abroad",
       "publisher": [
         1
       ],
       "order": 1
     },
     {
       "code": "208000000",
       "name": "海外",
       "sub": [],
       "region": "Abroad",
       "publisher": [
         1,
         2
       ],
       "order": 2
     }
   ];

   private region_lists_optimization = [
    {
      "code": "9010000",
      "name": "北京",
      "sub": [],
      "region": "North",
      "order": 1
    },
    {
      "code": "9020000",
      "name": "天津",
      "sub": [],
      "region": "North",
      "order": 2
    },
    {
      "code": "9030000",
      "name": "河北",
      "all": true,
      "sub": [
        {"code": "9030000", "name": "全部"},
        {"code": "9030100", "name": "石家庄"},
        {"code": "9030200", "name": "唐山"},
        {"code": "9030300", "name": "秦皇岛"},
        {"code": "9030400", "name": "邯郸"},
        {"code": "9030500", "name": "邢台"},
        {"code": "9030600", "name": "保定"},
        {"code": "9030700", "name": "张家口"},
        {"code": "9030800", "name": "承德"},
        {"code": "9030900", "name": "沧州"},
        {"code": "9031000", "name": "廊坊"},
        {"code": "9031100", "name": "衡水"}
      ],
      "region": "North",
      "order": 3
    },
    {
      "code": "9040000",
      "name": "山西",
      "all": true,
      "sub": [
        {"code": "9040000", "name": "全部"},
        {"code": "9040100", "name": "太原"},
        {"code": "9040200", "name": "大同"},
        {"code": "9040300", "name": "阳泉"},
        {"code": "9040400", "name": "长治"},
        {"code": "9040500", "name": "晋城"},
        {"code": "9040600", "name": "朔州"},
        {"code": "9040700", "name": "晋中"},
        {"code": "9040800", "name": "运城"},
        {"code": "9040900", "name": "忻州"},
        {"code": "9041000", "name": "临汾"},
        {"code": "9041100", "name": "吕梁"}
      ],
      "region": "North",
      "order": 4
    },
    {
      "code": "9050000",
      "name": "内蒙古",
      "all": true,
      "sub": [
        {"code": "9050000", "name": "全部"},
        {"code": "9050100", "name": "呼和浩特"},
        {"code": "9050200", "name": "包头"},
        {"code": "9050600", "name": "鄂尔多斯"},
        {"code": "9050300", "name": "乌海"},
        {"code": "9050400", "name": "赤峰"},
        {"code": "9051100", "name": "锡林郭勒盟"},
        {"code": "9050500", "name": "通辽"},
        {"code": "9050700", "name": "呼伦贝尔"},
        {"code": "9050800", "name": "巴彦淖尔"},
        {"code": "9050900", "name": "乌兰察布"},
        {"code": "9051000", "name": "兴安盟"},
        {"code": "9051200", "name": "阿拉善盟"}
      ],
      "region": "North",
      "order": 5
    },
    {
      "code": "9060000",
      "name": "辽宁",
      "all": true,
      "sub": [
        {"code": "9060000", "name": "全部"},
        {"code": "9060100", "name": "沈阳"},
        {"code": "9060200", "name": "大连"},
        {"code": "9060300", "name": "鞍山"},
        {"code": "9060400", "name": "抚顺"},
        {"code": "9060500", "name": "本溪"},
        {"code": "9060600", "name": "丹东"},
        {"code": "9060700", "name": "锦州"},
        {"code": "9060800", "name": "营口"},
        {"code": "9060900", "name": "阜新"},
        {"code": "9061000", "name": "辽阳"},
        {"code": "9061100", "name": "盘锦"},
        {"code": "9061200", "name": "铁岭"},
        {"code": "9061300", "name": "朝阳"},
        {"code": "9061400", "name": "葫芦岛"}
      ],
      "region": "Northeast",
      "is_north_east": true,
      "order": 1
    },
    {
      "code": "9070000",
      "name": "吉林",
      "all": true,
      "sub": [
        {"code": "9070000", "name": "全部"},
        {"code": "9070100", "name": "长春"},
        {"code": "9070200", "name": "吉林"},
        {"code": "9070300", "name": "四平"},
        {"code": "9070400", "name": "辽源"},
        {"code": "9070500", "name": "通化"},
        {"code": "9070600", "name": "白山"},
        {"code": "9070700", "name": "延边"},
        {"code": "9070800", "name": "白城"}
      ],
      "region": "Northeast",
      "order": 2
    },
    {
      "code": "9080000",
      "name": "黑龙江",
      "all": true,
      "sub": [
        {"code": "9080000", "name": "全部"},
        {"code": "9080100", "name": "哈尔滨"},
        {"code": "9080200", "name": "齐齐哈尔"},
        {"code": "9080300", "name": "鸡西"},
        {"code": "9080400", "name": "鹤岗"},
        {"code": "9080500", "name": "双鸭山"},
        {"code": "9080600", "name": "大庆"},
        {"code": "9080700", "name": "伊春"},
        {"code": "9080800", "name": "佳木斯"},
        {"code": "9080900", "name": "七台河"},
        {"code": "9081000", "name": "牡丹江"},
        {"code": "9081100", "name": "黑河"},
        {"code": "9081200", "name": "绥化"},
        {"code": "9081300", "name": "大兴安岭"}
      ],
      "region": "Northeast",
      "order": 3
    },
    {
      "code": "9090000",
      "name": "上海",
      "sub": [],
      "region": "East",
      "order": 1
    },
    {
      "code": "9100000",
      "name": "江苏",
      "all": true,
      "sub": [
        {"code": "9100000", "name": "全部"},
        {"code": "9100100", "name": "南京"},
        {"code": "9100200", "name": "无锡"},
        {"code": "9100300", "name": "徐州"},
        {"code": "9100400", "name": "常州"},
        {"code": "9100500", "name": "苏州"},
        {"code": "9100600", "name": "南通"},
        {"code": "9100700", "name": "连云港"},
        {"code": "9100800", "name": "淮安"},
        {"code": "9100900", "name": "盐城"},
        {"code": "9101000", "name": "扬州"},
        {"code": "9101100", "name": "镇江"},
        {"code": "9101200", "name": "泰州"},
        {"code": "9101300", "name": "宿迁"}
      ],
      "region": "East",
      "order": 2
    },
    {
      "code": "9110000",
      "name": "浙江",
      "all": true,
      "sub": [
        {"code": "9110000", "name": "全部"},
        {"code": "9110100", "name": "杭州"},
        {"code": "9110200", "name": "宁波"},
        {"code": "9110300", "name": "温州"},
        {"code": "9110400", "name": "嘉兴"},
        {"code": "9110500", "name": "湖州"},
        {"code": "9110600", "name": "绍兴"},
        {"code": "9110700", "name": "金华"},
        {"code": "9110800", "name": "衢州"},
        {"code": "9110900", "name": "舟山"},
        {"code": "9111000", "name": "台州"},
        {"code": "9111100", "name": "丽水"}
      ],
      "region": "East",
      "order": 3
    },
    {
      "code": "9120000",
      "name": "安徽",
      "all": true,
      "sub": [
        {"code": "9120000", "name": "全部"},
        {"code": "9120100", "name": "合肥"},
        {"code": "9120109", "name": "巢湖"},
        {"code": "9120200", "name": "芜湖"},
        {"code": "9120300", "name": "蚌埠"},
        {"code": "9120400", "name": "淮南"},
        {"code": "9120500", "name": "马鞍山"},
        {"code": "9120600", "name": "淮北"},
        {"code": "9120700", "name": "铜陵"},
        {"code": "9120800", "name": "安庆"},
        {"code": "9120900", "name": "黄山"},
        {"code": "9121000", "name": "滁州"},
        {"code": "9121100", "name": "阜阳"},
        {"code": "9121200", "name": "宿州"},
        {"code": "9121300", "name": "六安"},
        {"code": "9121400", "name": "亳州"},
        {"code": "9121500", "name": "池州"},
        {"code": "9121600", "name": "宣城"}
      ],
      "region": "East",
      "order": 4
    },
    {
      "code": "9130000",
      "name": "福建",
      "all": true,
      "sub": [
        {"code": "9130000", "name": "全部"},
        {"code": "9130100", "name": "福州"},
        {"code": "9130200", "name": "厦门"},
        {"code": "9130300", "name": "莆田"},
        {"code": "9130400", "name": "三明"},
        {"code": "9130500", "name": "泉州"},
        {"code": "9130600", "name": "漳州"},
        {"code": "9130700", "name": "南平"},
        {"code": "9130800", "name": "龙岩"},
        {"code": "9130900", "name": "宁德"}
      ],
      "region": "East",
      "order": 5
    },
    {
      "code": "9140000",
      "name": "江西",
      "all": true,
      "sub": [
        {"code": "9140000", "name": "全部"},
        {"code": "9140100", "name": "南昌"},
        {"code": "9140200", "name": "景德镇"},
        {"code": "9140300", "name": "萍乡"},
        {"code": "9140400", "name": "九江"},
        {"code": "9140500", "name": "新余"},
        {"code": "9140600", "name": "鹰潭"},
        {"code": "9140700", "name": "赣州"},
        {"code": "9140800", "name": "吉安"},
        {"code": "9140900", "name": "宜春"},
        {"code": "9141000", "name": "抚州"},
        {"code": "9141100", "name": "上饶"}
      ],
      "region": "East",
      "order": 6
    },
    {
      "code": "9150000",
      "name": "山东",
      "all": true,
      "sub": [
        {"code": "9150000", "name": "全部"},
        {"code": "9150100", "name": "济南"},
        {"code": "9150200", "name": "青岛"},
        {"code": "9150300", "name": "淄博"},
        {"code": "9150400", "name": "枣庄"},
        {"code": "9150500", "name": "东营"},
        {"code": "9150600", "name": "烟台"},
        {"code": "9150700", "name": "潍坊"},
        {"code": "9150800", "name": "济宁"},
        {"code": "9150900", "name": "泰安"},
        {"code": "9151000", "name": "威海"},
        {"code": "9151100", "name": "日照"},
        {"code": "9151200", "name": "莱芜"},
        {"code": "9151300", "name": "临沂"},
        {"code": "9151400", "name": "德州"},
        {"code": "9151500", "name": "聊城"},
        {"code": "9151600", "name": "滨州"},
        {"code": "9151700", "name": "菏泽"}
      ],
      "region": "East",
      "order": 7
    },
    {
      "code": "9160000",
      "name": "河南",
      "all": true,
      "sub": [
        {"code": "9160000", "name": "全部"},
        {"code": "9160100", "name": "郑州"},
        {"code": "9160200", "name": "开封"},
        {"code": "9160300", "name": "洛阳"},
        {"code": "9160400", "name": "平顶山"},
        {"code": "9160500", "name": "安阳"},
        {"code": "9160600", "name": "鹤壁"},
        {"code": "9160700", "name": "新乡"},
        {"code": "9160800", "name": "焦作"},
        {"code": "9160900", "name": "濮阳"},
        {"code": "9161000", "name": "许昌"},
        {"code": "9161100", "name": "漯河"},
        {"code": "9161200", "name": "三门峡"},
        {"code": "9161300", "name": "南阳"},
        {"code": "9161400", "name": "商丘"},
        {"code": "9161500", "name": "信阳"},
        {"code": "9161600", "name": "周口"},
        {"code": "9161700", "name": "驻马店"},
        {"code": "9161801", "name": "济源"}
      ],
      "region": "Central",
      "order": 1
    },
    {
      "code": "9170000",
      "name": "湖北",
      "all": true,
      "sub": [
        {"code": "9170000", "name": "全部"},
        {"code": "9170100", "name": "武汉"},
        {"code": "9170200", "name": "黄石"},
        {"code": "9170300", "name": "十堰"},
        {"code": "9170400", "name": "宜昌"},
        {"code": "9170500", "name": "襄阳"},
        {"code": "9170600", "name": "鄂州"},
        {"code": "9170700", "name": "荆门"},
        {"code": "9170800", "name": "孝感"},
        {"code": "9170900", "name": "荆州"},
        {"code": "9171000", "name": "黄冈"},
        {"code": "9171100", "name": "咸宁"},
        {"code": "9171200", "name": "随州"},
        {"code": "9171300", "name": "恩施"},
        {"code": "9171401", "name": "仙桃"},
        {"code": "9171402", "name": "潜江"},
        {"code": "9171403", "name": "天门"},
        {"code": "9171404", "name": "神农架"}
      ],
      "region": "Central",
      "order": 2
    },
    {
      "code": "9180000",
      "name": "湖南",
      "all": true,
      "sub": [
        {"code": "9180000", "name": "全部"},
        {"code": "9180100", "name": "长沙"},
        {"code": "9180200", "name": "株洲"},
        {"code": "9180300", "name": "湘潭"},
        {"code": "9180400", "name": "衡阳"},
        {"code": "9180500", "name": "邵阳"},
        {"code": "9180600", "name": "岳阳"},
        {"code": "9180700", "name": "常德"},
        {"code": "9180800", "name": "张家界"},
        {"code": "9180900", "name": "益阳"},
        {"code": "9181000", "name": "郴州"},
        {"code": "9181100", "name": "永州"},
        {"code": "9181200", "name": "怀化"},
        {"code": "9181300", "name": "娄底"},
        {"code": "9181400", "name": "湘西"}
      ],
      "region": "Central",
      "order": 3
    },
    {
      "code": "9190000",
      "name": "广东",
      "all": true,
      "sub": [
        {"code": "9190000", "name": "全部"},
        {"code": "9190100", "name": "广州"},
        {"code": "9190200", "name": "韶关"},
        {"code": "9190300", "name": "深圳"},
        {"code": "9190400", "name": "珠海"},
        {"code": "9190500", "name": "汕头"},
        {"code": "9190600", "name": "佛山"},
        {"code": "9190700", "name": "江门"},
        {"code": "9190800", "name": "湛江"},
        {"code": "9190900", "name": "茂名"},
        {"code": "9191000", "name": "肇庆"},
        {"code": "9191100", "name": "惠州"},
        {"code": "9191200", "name": "梅州"},
        {"code": "9191300", "name": "汕尾"},
        {"code": "9191400", "name": "河源"},
        {"code": "9191500", "name": "阳江"},
        {"code": "9191600", "name": "清远"},
        {"code": "9191700", "name": "东莞"},
        {"code": "9191800", "name": "中山"},
        {"code": "9191900", "name": "潮州"},
        {"code": "9192000", "name": "揭阳"},
        {"code": "9192100", "name": "云浮"}
      ],
      "region": "South",
      "order": 1
    },
    {
      "code": "9210000",
      "name": "海南",
      "all": true,
      "sub": [
        {"code": "9210000", "name": "全部"},
        {"code": "9210100", "name": "海口"},
        {"code": "9210200", "name": "三亚"},
        {"code": "9210411", "name": "白沙黎族自治县"},
        {"code": "9210401", "name": "五指山"},
        {"code": "9210402", "name": "琼海"},
        {"code": "9210412", "name": "昌江黎族自治县"},
        {"code": "9210403", "name": "儋州"},
        {"code": "9210404", "name": "文昌"},
        {"code": "9210413", "name": "乐东黎族自治县"},
        {"code": "9210405", "name": "万宁"},
        {"code": "9210406", "name": "东方"},
        {"code": "9210414", "name": "陵水黎族自治县"},
        {"code": "9210407", "name": "定安县"},
        {"code": "9210408", "name": "屯昌县"},
        {"code": "9210415", "name": "保亭黎族苗族自治县"},
        {"code": "9210409", "name": "澄迈县"},
        {"code": "9210410", "name": "临高县"},
        {"code": "9210416", "name": "琼中黎族苗族自治县"}
      ],
      "region": "South",
      "order": 2
    },
    {
      "code": "9200000",
      "name": "广西",
      "all": true,
      "sub": [
        {"code": "9200000", "name": "全部"},
        {"code": "9200100", "name": "南宁"},
        {"code": "9200200", "name": "柳州"},
        {"code": "9200300", "name": "桂林"},
        {"code": "9200400", "name": "梧州"},
        {"code": "9200500", "name": "北海"},
        {"code": "9200600", "name": "防城港"},
        {"code": "9200700", "name": "钦州"},
        {"code": "9200800", "name": "贵港"},
        {"code": "9200900", "name": "玉林"},
        {"code": "9201000", "name": "百色"},
        {"code": "9201100", "name": "贺州"},
        {"code": "9201200", "name": "河池"},
        {"code": "9201300", "name": "来宾"},
        {"code": "9201400", "name": "崇左"}
      ],
      "region": "South",
      "order": 3
    },
    {
      "code": "9220000",
      "name": "重庆",
      "sub": [],
      "region": "Southwest",
      "order": 1
    },
    {
      "code": "9230000",
      "name": "四川",
      "all": true,
      "sub": [
        {"code": "9230000", "name": "全部"},
        {"code": "9230100", "name": "成都"},
        {"code": "9230200", "name": "自贡"},
        {"code": "9230300", "name": "攀枝花"},
        {"code": "9230400", "name": "泸州"},
        {"code": "9230500", "name": "德阳"},
        {"code": "9230600", "name": "绵阳"},
        {"code": "9230700", "name": "广元"},
        {"code": "9230800", "name": "遂宁"},
        {"code": "9230900", "name": "内江"},
        {"code": "9231000", "name": "乐山"},
        {"code": "9231100", "name": "南充"},
        {"code": "9231200", "name": "眉山"},
        {"code": "9231300", "name": "宜宾"},
        {"code": "9231400", "name": "广安"},
        {"code": "9231500", "name": "达州"},
        {"code": "9231600", "name": "雅安"},
        {"code": "9231700", "name": "巴中"},
        {"code": "9231800", "name": "资阳"},
        {"code": "9231900", "name": "阿坝"},
        {"code": "9232000", "name": "甘孜"},
        {"code": "9232100", "name": "凉山"}
      ],
      "region": "Southwest",
      "order": 2
    },
    {
      "code": "9240000",
      "name": "贵州",
      "all": true,
      "sub": [
        {"code": "9240000", "name": "全部"},
        {"code": "9240100", "name": "贵阳"},
        {"code": "9240200", "name": "六盘水"},
        {"code": "9240300", "name": "遵义"},
        {"code": "9240400", "name": "安顺"},
        {"code": "9240500", "name": "毕节"},
        {"code": "9240600", "name": "铜仁"},
        {"code": "9240700", "name": "黔西南"},
        {"code": "9240800", "name": "黔东南"},
        {"code": "9240900", "name": "黔南"}
      ],
      "region": "Southwest",
      "order": 3
    },
    {
      "code": "9250000",
      "name": "云南",
      "all": true,
      "sub": [
        {"code": "9250000", "name": "全部"},
        {"code": "9250100", "name": "昆明"},
        {"code": "9250200", "name": "曲靖"},
        {"code": "9250300", "name": "玉溪"},
        {"code": "9250400", "name": "保山"},
        {"code": "9250500", "name": "昭通"},
        {"code": "9250600", "name": "丽江"},
        {"code": "9250700", "name": "普洱"},
        {"code": "9250800", "name": "临沧"},
        {"code": "9250900", "name": "楚雄"},
        {"code": "9251000", "name": "红河"},
        {"code": "9251100", "name": "文山"},
        {"code": "9251200", "name": "西双版纳"},
        {"code": "9251300", "name": "大理"},
        {"code": "9251400", "name": "德宏"},
        {"code": "9251500", "name": "怒江"},
        {"code": "9251600", "name": "迪庆"}
      ],
      "region": "Southwest",
      "order": 4
    },
    {
      "code": "9260000",
      "name": "西藏",
      "all": true,
      "sub": [
        {"code": "9260000", "name": "全部"},
        {"code": "9260100", "name": "拉萨"},
        {"code": "9260200", "name": "日喀则"},
        {"code": "9260300", "name": "昌都"},
        {"code": "9260400", "name": "山南"},
        {"code": "9260500", "name": "那曲"},
        {"code": "9260600", "name": "阿里"},
        {"code": "9260700", "name": "林芝"}
      ],
      "region": "Southwest",
      "order": 5
    },
    {
      "code": "9270000",
      "name": "陕西",
      "all": true,
      "sub": [
        {"code": "9270000", "name": "全部"},
        {"code": "9270100", "name": "西安"},
        {"code": "9270200", "name": "铜川"},
        {"code": "9270300", "name": "宝鸡"},
        {"code": "9270400", "name": "咸阳"},
        {"code": "9270500", "name": "渭南"},
        {"code": "9270600", "name": "延安"},
        {"code": "9270700", "name": "汉中"},
        {"code": "9270800", "name": "榆林"},
        {"code": "9270900", "name": "安康"},
        {"code": "9271000", "name": "商洛"}
      ],
      "region": "Northwest",
      "order": 1
    },
    {
      "code": "9280000",
      "name": "甘肃",
      "all": true,
      "sub": [
        {"code": "9280000", "name": "全部"},
        {"code": "9280100", "name": "兰州"},
        {"code": "9280200", "name": "嘉峪关"},
        {"code": "9280300", "name": "金昌"},
        {"code": "9280400", "name": "白银"},
        {"code": "9280500", "name": "天水"},
        {"code": "9280600", "name": "武威"},
        {"code": "9280700", "name": "张掖"},
        {"code": "9280800", "name": "平凉"},
        {"code": "9280900", "name": "酒泉"},
        {"code": "9281000", "name": "庆阳"},
        {"code": "9281100", "name": "定西"},
        {"code": "9281200", "name": "陇南"},
        {"code": "9281300", "name": "临夏"},
        {"code": "9281400", "name": "甘南"}
      ],
      "region": "Northwest",
      "order": 2
    },
    {
      "code": "9290000",
      "name": "青海",
      "all": true,
      "sub": [
        {"code": "9290000", "name": "全部"},
        {"code": "9290100", "name": "西宁"},
        {"code": "9290200", "name": "海东"},
        {"code": "9290300", "name": "海北"},
        {"code": "9290400", "name": "黄南"},
        {"code": "9290500", "name": "海南"},
        {"code": "9290600", "name": "果洛"},
        {"code": "9290700", "name": "玉树"},
        {"code": "9290800", "name": "海西"}
      ],
      "region": "Northwest",
      "order": 3
    },
    {
      "code": "9300000",
      "name": "宁夏",
      "all": true,
      "sub": [
        {"code": "9300000", "name": "全部"},
        {"code": "9300100", "name": "银川"},
        {"code": "9300200", "name": "石嘴山"},
        {"code": "9300300", "name": "吴忠"},
        {"code": "9300400", "name": "固原"},
        {"code": "9300500", "name": "中卫"}
      ],
      "region": "Northwest",
      "order": 4
    },
    {
      "code": "9310000",
      "name": "新疆",
      "all": true,
      "sub": [
        {"code": "9310000", "name": "全部"},
        {"code": "9310100", "name": "乌鲁木齐"},
        {"code": "9310400", "name": "哈密"},
        {"code": "9310300", "name": "吐鲁番"},
        {"code": "9310200", "name": "克拉玛依"},
        {"code": "9310500", "name": "昌吉"},
        {"code": "9311400", "name": "阿勒泰"},
        {"code": "9310600", "name": "博尔塔拉"},
        {"code": "9311200", "name": "伊犁"},
        {"code": "9310800", "name": "阿克苏"},
        {"code": "9310700", "name": "巴音郭楞"},
        {"code": "9311000", "name": "喀什"},
        {"code": "9310900", "name": "克孜勒苏柯尔克孜"},
        {"code": "9311503", "name": "图木舒克"},
        {"code": "9311100", "name": "和田"},
        {"code": "9311300", "name": "塔城"},
        {"code": "9311501", "name": "石河子"},
        {"code": "9311502", "name": "阿拉尔"},
        {"code": "9311504", "name": "五家渠"}
      ],
      "region": "Northwest",
      "order": 5
    },
    {
      "code": "9330000",
      "name": "香港",
      "sub": [],
      "region": "Honkong",
      "order": 1
    },
    {
      "code": "9340000",
      "name": "澳门",
      "sub": [],
      "region": "Macao",
      "order": 2
    },
    {
      "code": "9320000",
      "name": "台湾",
      "sub": [],
      "region": "Taiwan",
      "order": 3
    },
     {
       "code": "12000000",
       "name": "日本",
       "sub": [],
       "region": "Abroad",
       "publisher": [1],
       "order": 1
     },
     {
       "code": "208000000",
       "name": "海外",
       "sub": [],
       "region": "Abroad",
       "publisher": [1, 2],
       "order": 2
     }
  ];
   private region_lists_city =[{"name":"一线城市","code":"100000001","sub":[{"name":"北京","code":"9010000"},{"name":"上海","code":"9090000"},{"name":"广州","code":"9190100"},{"name":"深圳","code":"9190300"}]},{"name":"新一线城市","code":"100000002","sub":[{"name":"天津","code":"9020000"},{"name":"重庆","code":"9220000"},{"name":"佛山","code":"9190600"},{"name":"东莞","code":"9191700"},{"name":"合肥","code":"9120100"},{"name":"郑州","code":"9160100"},{"name":"武汉","code":"9170100"},{"name":"长沙","code":"9180100"},{"name":"南京","code":"9100100"},{"name":"苏州","code":"9100500"},{"name":"沈阳","code":"9060100"},{"name":"青岛","code":"9150200"},{"name":"西安","code":"9270100"},{"name":"成都","code":"9230100"},{"name":"杭州","code":"9110100"}]},{"name":"二线城市","code":"100000003","sub":[{"name":"中山","code":"9191800"},{"name":"珠海","code":"9190400"},{"name":"惠州","code":"9191100"},{"name":"泉州","code":"9130500"},{"name":"厦门","code":"9130200"},{"name":"福州","code":"9130100"},{"name":"海口","code":"9210100"},{"name":"贵阳","code":"9240100"},{"name":"兰州","code":"9280100"},{"name":"南宁","code":"9200100"},{"name":"石家庄","code":"9030100"},{"name":"哈尔滨","code":"9080100"},{"name":"长春","code":"9070100"},{"name":"常州","code":"9100400"},{"name":"南通","code":"9100600"},{"name":"徐州","code":"9100300"},{"name":"无锡","code":"9100200"},{"name":"扬州","code":"9101000"},{"name":"南昌","code":"9140100"},{"name":"大连","code":"9060200"},{"name":"济南","code":"9150100"},{"name":"烟台","code":"9150600"},{"name":"太原","code":"9040100"},{"name":"昆明","code":"9250100"},{"name":"金华","code":"9110700"},{"name":"嘉兴","code":"9110400"},{"name":"宁波","code":"9110200"},{"name":"绍兴","code":"9110600"},{"name":"温州","code":"9110300"},{"name":"台州","code":"9111000"}]},{"name":"三线城市","code":"100000004","sub":[{"name":"江门","code":"9190700"},{"name":"揭阳","code":"9192000"},{"name":"潮州","code":"9191900"},{"name":"梅州","code":"9191200"},{"name":"清远","code":"9191600"},{"name":"汕头","code":"9190500"},{"name":"湛江","code":"9190800"},{"name":"肇庆","code":"9191000"},{"name":"莆田","code":"9130300"},{"name":"南平","code":"9130700"},{"name":"龙岩","code":"9130800"},{"name":"宁德","code":"9130900"},{"name":"三明","code":"9130400"},{"name":"漳州","code":"9130600"},{"name":"三亚","code":"9210200"},{"name":"安庆","code":"9120800"},{"name":"滁州","code":"9121000"},{"name":"马鞍山","code":"9120500"},{"name":"巢湖","code":"9120109"},{"name":"芜湖","code":"9120200"},{"name":"阜阳","code":"9121100"},{"name":"蚌埠","code":"9120300"},{"name":"遵义","code":"9240300"},{"name":"桂林","code":"9200300"},{"name":"柳州","code":"9200200"},{"name":"保定","code":"9030600"},{"name":"沧州","code":"9030900"},{"name":"廊坊","code":"9031000"},{"name":"秦皇岛","code":"9030300"},{"name":"唐山","code":"9030200"},{"name":"邯郸","code":"9030400"},{"name":"洛阳","code":"9160300"},{"name":"南阳","code":"9161300"},{"name":"新乡","code":"9160700"},{"name":"信阳","code":"9161500"},{"name":"商丘","code":"9161400"},{"name":"大庆","code":"9080600"},{"name":"荆州","code":"9170900"},{"name":"襄阳","code":"9170500"},{"name":"宜昌","code":"9170400"},{"name":"郴州","code":"9181000"},{"name":"湘潭","code":"9180300"},{"name":"衡阳","code":"9180400"},{"name":"岳阳","code":"9180600"},{"name":"株洲","code":"9180200"},{"name":"吉林","code":"9070200"},{"name":"淮安","code":"9100800"},{"name":"连云港","code":"9100700"},{"name":"宿迁","code":"9101300"},{"name":"泰州","code":"9101200"},{"name":"盐城","code":"9100900"},{"name":"镇江","code":"9101100"},{"name":"九江","code":"9140400"},{"name":"上饶","code":"9141100"},{"name":"赣州","code":"9140700"},{"name":"鞍山","code":"9060300"},{"name":"呼和浩特","code":"9050100"},{"name":"包头","code":"9050200"},{"name":"银川","code":"9300100"},{"name":"济宁","code":"9150800"},{"name":"临沂","code":"9151300"},{"name":"潍坊","code":"9150700"},{"name":"淄博","code":"9150300"},{"name":"泰安","code":"9150900"},{"name":"威海","code":"9151000"},{"name":"咸阳","code":"9270400"},{"name":"绵阳","code":"9230600"},{"name":"南充","code":"9231100"},{"name":"乌鲁木齐","code":"9310100"},{"name":"丽水","code":"9111100"},{"name":"舟山","code":"9110900"},{"name":"湖州","code":"9110500"}]},{"name":"四线城市","code":"100000005","sub":[{"name":"茂名","code":"9190900"},{"name":"汕尾","code":"9191300"},{"name":"韶关","code":"9190200"},{"name":"阳江","code":"9191500"},{"name":"河源","code":"9191400"},{"name":"黄山","code":"9120900"},{"name":"淮南","code":"9120400"},{"name":"六安","code":"9121300"},{"name":"宣城","code":"9121600"},{"name":"宿州","code":"9121200"},{"name":"铜陵","code":"9120700"},{"name":"亳州","code":"9121400"},{"name":"安顺","code":"9240400"},{"name":"六盘水","code":"9240200"},{"name":"黔南","code":"9240900"},{"name":"黔东南","code":"9240800"},{"name":"毕节","code":"9240500"},{"name":"铜仁","code":"9240600"},{"name":"梧州","code":"9200400"},{"name":"北海","code":"9200500"},{"name":"玉林","code":"9200900"},{"name":"百色","code":"9201000"},{"name":"承德","code":"9030800"},{"name":"邢台","code":"9030500"},{"name":"张家口","code":"9030700"},{"name":"焦作","code":"9160800"},{"name":"安阳","code":"9160500"},{"name":"开封","code":"9160200"},{"name":"平顶山","code":"9160400"},{"name":"驻马店","code":"9161700"},{"name":"许昌","code":"9161000"},{"name":"周口","code":"9161600"},{"name":"佳木斯","code":"9080800"},{"name":"牡丹江","code":"9081000"},{"name":"齐齐哈尔","code":"9080200"},{"name":"绥化","code":"9081200"},{"name":"黄石","code":"9170200"},{"name":"黄冈","code":"9171000"},{"name":"孝感","code":"9170800"},{"name":"恩施","code":"9171300"},{"name":"十堰","code":"9170300"},{"name":"咸宁","code":"9171100"},{"name":"怀化","code":"9181200"},{"name":"常德","code":"9180700"},{"name":"娄底","code":"9181300"},{"name":"邵阳","code":"9180500"},{"name":"益阳","code":"9180900"},{"name":"永州","code":"9181100"},{"name":"延边","code":"9070700"},{"name":"吉安","code":"9140800"},{"name":"景德镇","code":"9140200"},{"name":"宜春","code":"9140900"},{"name":"鹰潭","code":"9140600"},{"name":"抚州","code":"9141000"},{"name":"丹东","code":"9060600"},{"name":"锦州","code":"9060700"},{"name":"盘锦","code":"9061100"},{"name":"营口","code":"9060800"},{"name":"赤峰","code":"9050400"},{"name":"鄂尔多斯","code":"9050600"},{"name":"西宁","code":"9290100"},{"name":"聊城","code":"9151500"},{"name":"德州","code":"9151400"},{"name":"日照","code":"9151100"},{"name":"莱芜","code":"9151200"},{"name":"东营","code":"9150500"},{"name":"枣庄","code":"9150400"},{"name":"菏泽","code":"9151700"},{"name":"滨州","code":"9151600"},{"name":"晋中","code":"9040700"},{"name":"临汾","code":"9041000"},{"name":"运城","code":"9040800"},{"name":"大同","code":"9040200"},{"name":"宝鸡","code":"9270300"},{"name":"渭南","code":"9270500"},{"name":"榆林","code":"9270800"},{"name":"眉山","code":"9231200"},{"name":"德阳","code":"9230500"},{"name":"乐山","code":"9231000"},{"name":"泸州","code":"9230400"},{"name":"宜宾","code":"9231300"},{"name":"拉萨","code":"9260100"},{"name":"丽江","code":"9250600"},{"name":"德宏","code":"9251400"},{"name":"曲靖","code":"9250200"},{"name":"保山","code":"9250400"},{"name":"大理","code":"9251300"},{"name":"红河","code":"9251000"},{"name":"西双版纳","code":"9251200"},{"name":"衢州","code":"9110800"}]},{"name":"其它","code":"100000006","sub":[{"name":"云浮","code":"9192100"},{"name":"东方","code":"9210406"},{"name":"保亭黎族苗族自治县","code":"9210415"},{"name":"琼海","code":"9210402"},{"name":"文昌","code":"9210404"},{"name":"陵水黎族自治县","code":"9210414"},{"name":"五指山","code":"9210401"},{"name":"万宁","code":"9210405"},{"name":"琼中黎族苗族自治县","code":"9210416"},{"name":"儋州","code":"9210403"},{"name":"定安县","code":"9210407"},{"name":"乐东黎族自治县","code":"9210413"},{"name":"屯昌县","code":"9210408"},{"name":"澄迈县","code":"9210409"},{"name":"昌江黎族自治县","code":"9210412"},{"name":"临高县","code":"9210410"},{"name":"淮北","code":"9120600"},{"name":"白沙黎族自治县","code":"9210411"},{"name":"池州","code":"9121500"},{"name":"黔西南","code":"9240700"},{"name":"酒泉","code":"9280900"},{"name":"金昌","code":"9280300"},{"name":"嘉峪关","code":"9280200"},{"name":"陇南","code":"9281200"},{"name":"平凉","code":"9280800"},{"name":"临夏","code":"9281300"},{"name":"庆阳","code":"9281000"},{"name":"定西","code":"9281100"},{"name":"武威","code":"9280600"},{"name":"天水","code":"9280500"},{"name":"张掖","code":"9280700"},{"name":"白银","code":"9280400"},{"name":"甘南","code":"9281400"},{"name":"贵港","code":"9200800"},{"name":"防城港","code":"9200600"},{"name":"来宾","code":"9201300"},{"name":"钦州","code":"9200700"},{"name":"河池","code":"9201200"},{"name":"贺州","code":"9201100"},{"name":"崇左","code":"9201400"},{"name":"衡水","code":"9031100"},{"name":"漯河","code":"9161100"},{"name":"濮阳","code":"9160900"},{"name":"三门峡","code":"9161200"},{"name":"鹤壁","code":"9160600"},{"name":"济源","code":"9161801"},{"name":"鸡西","code":"9080300"},{"name":"七台河","code":"9080900"},{"name":"双鸭山","code":"9080500"},{"name":"伊春","code":"9080700"},{"name":"大兴安岭","code":"9081300"},{"name":"鹤岗","code":"9080400"},{"name":"黑河","code":"9081100"},{"name":"荆门","code":"9170700"},{"name":"潜江","code":"9171402"},{"name":"随州","code":"9171200"},{"name":"神农架","code":"9171404"},{"name":"仙桃","code":"9171401"},{"name":"天门","code":"9171403"},{"name":"鄂州","code":"9170600"},{"name":"湘西","code":"9181400"},{"name":"张家界","code":"9180800"},{"name":"白城","code":"9070800"},{"name":"辽源","code":"9070400"},{"name":"白山","code":"9070600"},{"name":"四平","code":"9070300"},{"name":"通化","code":"9070500"},{"name":"萍乡","code":"9140300"},{"name":"新余","code":"9140500"},{"name":"本溪","code":"9060500"},{"name":"朝阳","code":"9061300"},{"name":"辽阳","code":"9061000"},{"name":"阜新","code":"9060900"},{"name":"抚顺","code":"9060400"},{"name":"铁岭","code":"9061200"},{"name":"葫芦岛","code":"9061400"},{"name":"阿拉善盟","code":"9051200"},{"name":"兴安盟","code":"9051000"},{"name":"通辽","code":"9050500"},{"name":"巴彦淖尔","code":"9050800"},{"name":"乌兰察布","code":"9050900"},{"name":"乌海","code":"9050300"},{"name":"呼伦贝尔","code":"9050700"},{"name":"锡林郭勒盟","code":"9051100"},{"name":"固原","code":"9300400"},{"name":"石嘴山","code":"9300200"},{"name":"吴忠","code":"9300300"},{"name":"中卫","code":"9300500"},{"name":"海东","code":"9290200"},{"name":"海西","code":"9290800"},{"name":"玉树","code":"9290700"},{"name":"海南","code":"9290500"},{"name":"海北","code":"9290300"},{"name":"黄南","code":"9290400"},{"name":"果洛","code":"9290600"},{"name":"晋城","code":"9040500"},{"name":"长治","code":"9040400"},{"name":"吕梁","code":"9041100"},{"name":"忻州","code":"9040900"},{"name":"朔州","code":"9040600"},{"name":"阳泉","code":"9040300"},{"name":"安康","code":"9270900"},{"name":"商洛","code":"9271000"},{"name":"铜川","code":"9270200"},{"name":"延安","code":"9270600"},{"name":"汉中","code":"9270700"},{"name":"广安","code":"9231400"},{"name":"广元","code":"9230700"},{"name":"凉山","code":"9232100"},{"name":"攀枝花","code":"9230300"},{"name":"内江","code":"9230900"},{"name":"甘孜","code":"9232000"},{"name":"遂宁","code":"9230800"},{"name":"资阳","code":"9231800"},{"name":"巴中","code":"9231700"},{"name":"达州","code":"9231500"},{"name":"雅安","code":"9231600"},{"name":"阿坝","code":"9231900"},{"name":"自贡","code":"9230200"},{"name":"那曲","code":"9260500"},{"name":"林芝","code":"9260700"},{"name":"日喀则","code":"9260200"},{"name":"昌都","code":"9260300"},{"name":"山南","code":"9260400"},{"name":"阿里","code":"9260600"},{"name":"哈密","code":"9310400"},{"name":"博尔塔拉","code":"9310600"},{"name":"昌吉","code":"9310500"},{"name":"阿勒泰","code":"9311400"},{"name":"喀什","code":"9311000"},{"name":"克拉玛依","code":"9310200"},{"name":"克孜勒苏柯尔克孜","code":"9310900"},{"name":"阿克苏","code":"9310800"},{"name":"石河子","code":"9311501"},{"name":"塔城","code":"9311300"},{"name":"五家渠","code":"9311504"},{"name":"吐鲁番","code":"9310300"},{"name":"巴音郭楞","code":"9310700"},{"name":"伊犁","code":"9311200"},{"name":"和田","code":"9311100"},{"name":"阿拉尔","code":"9311502"},{"name":"图木舒克","code":"9311503"},{"name":"楚雄","code":"9250900"},{"name":"临沧","code":"9250800"},{"name":"普洱","code":"9250700"},{"name":"文山","code":"9251100"},{"name":"昭通","code":"9250500"},{"name":"玉溪","code":"9250300"},{"name":"怒江","code":"9251500"},{"name":"迪庆","code":"9251600"},{"name":"香港","code":"9330000"},{"name":"台湾","code":"9320000"},{"name":"澳门","code":"9340000"}]}];
  constructor() {}

  getRegionLists() {
    return JSON.parse(JSON.stringify(this.region_lists));
  }
  getRegionListsCity() {
    return JSON.parse(JSON.stringify(this.region_lists_city));
  }
  getOptimiztionRegionLists() {
    return JSON.parse(JSON.stringify(this.region_lists_optimization));
  }
  getXhsRegionLists() {
    return JSON.parse(JSON.stringify(this.region_list_xhs));
  }
}
