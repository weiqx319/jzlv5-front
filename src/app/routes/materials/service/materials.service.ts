import { Injectable } from '@angular/core';
import { HttpClientService } from '../../../core/service/http.client';
import {environment} from "../../../../environments/environment";
import {HttpClient, HttpRequest} from "@angular/common/http";
import {of} from 'rxjs';

@Injectable()
export class MaterialsService {

  constructor(
    private _httpClient: HttpClientService,
    private originHttpClient: HttpClient,
  ) {}

  // 素材作者
  getMaterialsAuthorList(body, params?): any {
    const url = "/manager_base/material_author/get_list";
    return this._httpClient.post(url, body, params);
  }

  deleteMaterialsAuthor(author_id, params?): any {
    const url = "/manager_base/material_author/" + author_id;
    return this._httpClient.delete(url,{},  params);
  }

  addMaterialsAuthor(body, params?): any {
    const  url = '/manager_base/material_author';
    return this._httpClient.post(url, body, params);
  }

  updateMaterialsAuthor(author_id, body, params?): any {
    const  url = '/manager_base/material_author/' + author_id;
    return this._httpClient.put(url, body, params);
  }

  getVideoList(body, params) {
    const url = '/manager_base/material/get_list';
    return this._httpClient.post(url, body, params);
  }


  getImageList(body, params) {
    const url = '/manager_base/material/image_material/get_list';
    return this._httpClient.post(url, body, params);
  }


  // 上传视频素材
  uploadVideoMaterials(body, cid?): any {
    const  url = environment.SERVER_API_URL  + '/manager_base/material/upload_video?cid=' + cid;

    const req = new HttpRequest('POST', url, body, {
      reportProgress: true,
      withCredentials: true,
    });

    return this.originHttpClient.request(req);
  }


  uploadVideoBatchMaterials(body, cid?): any {
    const  url = environment.SERVER_API_URL  + '/manager_base/material/batch_upload_video?cid=' + cid;

    const req = new HttpRequest('POST', url, body, {
      reportProgress: true,
      withCredentials: true,
    });

    return this.originHttpClient.request(req);
  }
  // 上传视频素材
  uploadImageMaterials(body, cid?): any {
    const  url = environment.SERVER_API_URL  + '/manager_base/material/upload_image?cid=' + cid;

    const req = new HttpRequest('POST', url, body, {
      reportProgress: true,
      withCredentials: true,
    });

    return this.originHttpClient.request(req);
  }



  saveImageInfo(body, params?): any {
    const url = '/manager_base/material/save_images';
    return this._httpClient.post(url, body, params);
  }

  checkImageMd5(md5,params) {
    const  url = '/manager_base/material/image_material/check_md5/' + md5;
    return this._httpClient.get(url, params);
  }

  checkVideo(md5,params) {
    const  url = '/manager_base/material/material/check_md5/' + md5;
    return this._httpClient.get(url, params);
  }

  saveVideoInfo(body, params?): any {
    const url = '/manager_base/material/batch_save_video';
    return this._httpClient.post(url, body, params);
  }


  getImageSize(params?):any {
    const  url = '/manager_base/material/image_material/config';
    return this._httpClient.get(url,params);
  }


  // 修改素材详情
  getMaterialDetail(materialId, params?): any {
    const  url = '/manager_base/material/' + materialId;
    return this._httpClient.get(url, params);
  }

  // 修改素材详情
  getMaterialImageDetail(materialId, params?): any {
    const  url = '/manager_base/material/image_material/' + materialId;
    return this._httpClient.get(url, params);
  }

  updateMaterialDetail(body, params?): any {
    const  url = '/manager_base/material/' + body.material_id;
    return this._httpClient.put(url, body, params);
  }


  updateMaterialImageDetail(body, params?): any {
    const  url = '/manager_base/material/image_material/' + body.material_id;
    return this._httpClient.put(url, body, params);
  }

  deleteMaterials(material_id, params?): any {
    const url = "/manager_base/material/" + material_id;
    return this._httpClient.delete(url,{},  params);
  }


  deleteImageMaterials(material_id, params?): any {
    const url = "/manager_base/material/image_material/" + material_id;
    return this._httpClient.delete(url,{},  params);
  }


  // 文案
  getLaunchTitleList(body, params?): any {
    const url = "/manager_base/launch_title/get_list";
    return this._httpClient.post(url, body, params);
  }

  addLaunchTitle(body, params?): any {
    const url = '/manager_base/launch_title';
    return this._httpClient.post(url, body, params);
  }

  deleteLaunchTitles(body, params?): any {
    const url = "/manager_base/launch_title/delete";
    return this._httpClient.post(url, body, params);
  }

  getLaunchTitleWorld(params?): any {
    const url = "/manager_base/launch_title/get_word";
    return this._httpClient.get(url, params);
  }


  getLaunchTitleWorldBaidu(params?): any {
    const url = "/manager_base/launch_setting_baidu/get_monitor_symbol_list";
    return this._httpClient.post(url, params);
  }

  getLaunchTitleGroupList(body, params?): any {
    // const url = "/manager_base/launch_title/get_list";
    // return this._httpClient.post(url, body, params);
  }



  //根据指定下标，将字符串分割成两个字符串
  getStringByPosition(start_pos, end_pos, str) {
    let startStr = '';
    let endStr = '';
    if (str && end_pos <= str.length) { //光标位置不能超过字符串长度
      startStr = str.substring(0, start_pos);
      endStr = str.substring(end_pos, str.length);
    }

    return {
      startStr,
      endStr
    };
  }

  // 标题文案：数字、英文字母、英文标点符号都是半个字，奇数+1
  getStringLength(str, wordList) {
    let strNum = str.match(/\d|[A-Za-z]|\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\-|\=|\[|\]|\{|\}|\\|\||\;|\'|\'|\:|\"|\"|\,|\.|\/|\<|\>|\?+/g);
    if (!strNum) {
      strNum = [];
    }
    let length = str.length - strNum.length + Math.ceil((strNum.length/2));

    const checkAry = [];
    const adWord = [];
    let word = '';
    if(str) {
      for (const char of str) {
        if (char === '{') {
          checkAry.push(char);
          word = '';
        } else {
          if (checkAry.length === 1) {
            if (char == '}') {
              adWord.push(word);
              checkAry.pop();
            } else {
              word += char;
            }
          }
        }
      }

      for (let i = 0; i < adWord.length; i++) {
        if (wordList.includes(adWord[i])) {
          switch (adWord[i]) {
            case '地点': {
              length = length - (adWord[i].length + 1) + 4;
              break;
            }
            case '日期': {
              length = length - (adWord[i].length + 1) + 6;
              break;
            }
            case '星期': {
              length = length - (adWord[i].length + 1) + 3;
              break;
            }
            case '用餐类型': {
              length = length - (adWord[i].length + 1) + 2;
              break;
            }
            case '省份': {
              length = length - (adWord[i].length + 1) + 3;
              break;
            }
            case '月份': {
              length = length - (adWord[i].length + 1) + 3;
              break;
            }
            case '节日': {
              length = length - (adWord[i].length + 1) + 5;
              break;
            }
            case '网络环境': {
              length = length - (adWord[i].length + 1) + 4;
              break;
            }
            case '男人女人': {
              length = length - (adWord[i].length + 1) + 2;
              break;
            }
            case '帅哥美女': {
              length = length - (adWord[i].length + 1) + 2;
              break;
            }
            case '他她': {
              length = length - (adWord[i].length + 1) + 1;
              break;
            }
            case '反性别-夫妻': {
              length = length - (adWord[i].length + 1) + 2;
              break;
            }
            case '年龄': {
              length = length - (adWord[i].length + 1) + 3;
              break;
            }
            case '手机系统': {
              length = length - (adWord[i].length + 1) + 4;
              break;
            }
            case '运营商': {
              length = length - (adWord[i].length + 1) + 2;
              break;
            }
            case '区县': {
              length = length - (adWord[i].length + 1) + 6;
              break;
            }
            case '行业': {
              length = length - (adWord[i].length + 1) + 4;
              break;
            }
            case '家用电器': {
              length = length - (adWord[i].length + 1) + 4;
              break;
            }
            case '考试': {
              length = length - (adWord[i].length + 1) + 4;
              break;
            }
          }
        }
      }
    }
    return length;
  }

  // 匹配词包，最多两个并且在公共词包中
  matchFeedWord(str, wordList, isAdd?) {
    const checkAry = [];
    const adWord = [];
    const stack = [];
    let stackFlag = false;
    let word = '';
    if(str) {
      for (const char of str) {
        if (char === '{') {
          checkAry.push(char);
          word = '';
          stack.push('{');
        } else {
          if (char == '}') {
            if(stack.length == 0 ) {
              stackFlag = true;
            } else {
              stack.pop();
            }
          }

          if (checkAry.length === 1) {
            if (char == '}') {
              adWord.push(word);
              checkAry.pop();
            } else {
              word += char;
            }
          }
        }
      }
      if(stackFlag || stack.length > 0 ) {
        return {
          isMatch: false,
          tip: '文案中的括号不匹配'
        };
      } else  if (checkAry.length) {
        return {
          isMatch: false,
          tip: '文案中的括号不匹配'
        };
      } else {
        if (adWord.length > 2) {
          return {
            isMatch: false,
            tip: '每条文案的公共词包只能有两个'
          };
        }

        if (isAdd && adWord.length === 2) {
          return {
            isOver: true,
          };
        }

        for (let i = 0; i < adWord.length; i++) {
          if (!wordList.includes(adWord[i])) {
            return {
              isMatch: false,
              tip: '{}只能包含公共词包'
            };
            break;
          }
        }
      }

      return {
        isMatch: true,
      };
    }
  }

  // 匹配词包，最多一个并且在公共词包中
  matchOneFeedWord(str, wordList, isAdd?) {
    const checkAry = [];
    const adWord = [];
    const stack = [];
    let stackFlag = false;
    let word = '';
    if(str) {
      for (const char of str) {
        if (char === '{') {
          checkAry.push(char);
          word = '';
          stack.push('{');
        } else {
          if (char == '}') {
            if(stack.length == 0 ) {
              stackFlag = true;
            } else {
              stack.pop();
            }
          }

          if (checkAry.length === 1) {
            if (char == '}') {
              adWord.push(word);
              checkAry.pop();
            } else {
              word += char;
            }
          }
        }
      }
      if(stackFlag || stack.length > 0 ) {
        return {
          isMatch: false,
          tip: '文案中的括号不匹配'
        };
      } else  if (checkAry.length) {
        return {
          isMatch: false,
          tip: '文案中的括号不匹配'
        };
      } else {
        if (adWord.length > 1) {
          return {
            isMatch: false,
            tip: '每条文案的公共词包只能有一个'
          };
        }

        if (isAdd && adWord.length === 1) {
          return {
            isOver: true,
          };
        }

        for (let i = 0; i < adWord.length; i++) {
          if (!wordList.includes(adWord[i])) {
            return {
              isMatch: false,
              tip: '{}只能包含公共词包'
            };
            break;
          }
        }
      }

      return {
        isMatch: true,
      };
    }
  }

  // 修改封面图
  uploadCoverImage(material_id,body,params?) {
    const url = "/manager_base/material/front_cover/" + material_id;
    return this._httpClient.post(url, body, params);
  }
}
