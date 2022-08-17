import { Injectable } from '@angular/core';
import { HttpClientService } from "../../../core/service/http.client";
import { isArray } from "@jzl/jzl-util";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient, HttpRequest } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { objectKeys } from "codelyzer/util/objectKeys";

@Injectable({
  providedIn: 'root'
})
export class MaterialsManageService {

  public advertisers = [];
  public departmentList = [];
  public advertisersObj = {};

  public authorList = [];
  public VideoTypeConfig = {
    'video_type_1': '横版视频',
    'video_type_2': '竖版视频',
  };

  public ImageTypeConfig = {
    "publisher_7": {
      "image_type_1": "推广卡片主图",
      "image_type_2": "横版大图",
      "image_type_3": "竖版大图",
      "image_type_4": "小图"
    }
  };

  public TemplateStateConfig = {
    'status_0': '未运行',
    'status_1': '运行中',
    'status_2': '成功',
    'status_3': '失败',
    'status_4': '部分成功',
  };

  public VideoTypeConfigList = [{
    'key': '1',
    'name': '横版视频',
  }, {
    'key': '2',
    'name': '竖版视频',
  }
  ];
  public StatusConfigList = [{
    'key': 1,
    'name': '已确认',
  }, {
    'key': -1,
    'name': '未确认',
  }
  ];

  public ImageTypeConfigList = {
    "publisher_7":
      [{
        'key': '1',
        'name': '推广卡片主图',
      }, {
        'key': '2',
        'name': '横版大图',
      }, {
        'key': '3',
        'name': '竖版大图',
      }, {
        'key': '4',
        'name': '小图',
      }
      ]
  };
  public coverTypeConfigList = [{
    'key': 1,
    'name': '横版视频封面图',
  }, {
    'key': 2,
    'name': ' 竖版视频封面图',
  }];

  constructor(
    private _httpClient: HttpClientService,
    private originHttpClient: HttpClient
  ) { }

  getAdvertisers(): any {
    const url = "/manager_base/jazdl/get_list";
    if (this.advertisers.length > 1) {
      return of(this.advertisers);
    } else {
      return this._httpClient.post(url, {}, { result_model: 'all', need_publish_account: 0 }).pipe(
        map((response) => {
          if (response.status_code && response.status_code === 200) {
            if (isArray(response.data)) {
              response['data'].forEach((item) => {
                this.advertisers.push({
                  name: item.advertiser_name,
                  key: item.cid,
                  department: item.department
                });
                if (item.department) {
                  if (this.departmentList.indexOf(item.department) < 0) {
                    this.departmentList.push(item.department);
                  }
                  if (!this.advertisersObj[item.department]) {
                    this.advertisersObj[item.department] = [
                      {
                        name: item.advertiser_name,
                        key: item.cid,
                        department: item.department
                      }
                    ];
                  } else {
                    this.advertisersObj[item.department].push({
                      name: item.advertiser_name,
                      key: item.cid,
                      department: item.department
                    });
                  }

                }
              });
              return response.data;
            } else {
              return [];
            }
          } else {
            return [];
          }
        })
      );
    }
  }

  // 素材作者
  getMaterialsAuthorList(body, params?): any {
    const url = "/material_manage/author/get_list";
    return this._httpClient.post(url, body, params);
  }
  getMaterialsAuthorDetail(author_id, params?): any {
    const url = "/material_manage/author/get/" + author_id;
    return this._httpClient.get(url, params);
  }

  deleteMaterialsAuthor(body, params?): any {
    const url = "/material_manage/author/delete";
    return this._httpClient.delete(url, body, params);
  }

  addMaterialsAuthor(body, params?): any {
    const url = '/material_manage/author/add';
    return this._httpClient.post(url, body, params);
  }

  updateMaterialsAuthor(author_id, body, params?): any {
    const url = '/material_manage/author/edit/' + author_id;
    return this._httpClient.put(url, body, params);
  }

  // 修改素材详情
  getMaterialDetail(materialId, params?): any {
    const url = '/material_manage/video/material/' + materialId;
    return this._httpClient.get(url, params);
  }

  // 修改素材详情
  getMaterialImageDetail(materialId, params?): any {
    const url = '/material_manage/image/image_material/' + materialId;
    return this._httpClient.get(url, params);
  }


  deleteImageMaterials(materialId, body, params?): any {
    const url = '/material_manage/image/image_material/' + materialId;
    return this._httpClient.delete(url, body, params);
  }

  deleteImageMaterialsBatch(body, params?): any {
    const url = '/material_manage/image/image_material/batch_delete';
    return this._httpClient.delete(url, body, params);
  }

  updateMaterialDetail(body, params?): any {
    const url = '/material_manage/video/material/' + body.material_id;
    return this._httpClient.put(url, body, params);
  }
  updateMaterialImageDetail(body, params?): any {
    const url = '/material_manage/image/image_material/' + body.material_id;
    return this._httpClient.put(url, body, params);
  }

  // 视频列表
  getMaterialsVideoList(body, params?): any {
    const url = "/material_manage/video/video_list";
    return this._httpClient.post(url, body, params);
  }
  getVideoReportList(body, params?): any {
    const url = "/material_manage/video/video_report_list";
    return this._httpClient.post(url, body, params);
  }
  getVideoReportListNew(body, params?): any {
    const url = "/material_manage/video/video_cross_report";
    return this._httpClient.post(url, body, params);
  }
  // 图片列表
  getMaterialsImageList(body, params?): any {
    const url = "/material_manage/image/image_list";
    return this._httpClient.post(url, body, params);
  }
  getImageReportList(body, params?): any {
    const url = "/material_manage/image/image_cross_report";
    return this._httpClient.post(url, body, params);
  }
  // 头条封面图
  checkCoverImageMd5(md5, params) {
    const url = '/material_manage/screenshot/check_md5/' + md5;
    return this._httpClient.get(url, params);
  }
  checkImageMd5(md5, params) {
    const url = '/material_manage/image/check_md5/' + md5;
    return this._httpClient.get(url, params);
  }
  // 上传封面图
  uploadCoverImageMaterials(body, cid?): any {
    const url = environment.SERVER_API_URL + '/material_manage/screenshot/upload_image?cid=' + cid;

    const req = new HttpRequest('POST', url, body, {
      reportProgress: true,
      withCredentials: true,
    });

    return this.originHttpClient.request(req);
  }
  // 上传视频素材
  uploadVideoBatchMaterials(body, cid?): any {
    const url = environment.SERVER_API_URL + '/material_manage/video/batch_upload_video?cid=' + cid;

    const req = new HttpRequest('POST', url, body, {
      reportProgress: true,
      withCredentials: true,
    });

    return this.originHttpClient.request(req);
  }
  uploadImageMaterials(body, cid?): any {
    const url = environment.SERVER_API_URL + '/material_manage/image/upload_image?cid=' + cid;

    const req = new HttpRequest('POST', url, body, {
      reportProgress: true,
      withCredentials: true,
    });

    return this.originHttpClient.request(req);
  }

  checkVideo(md5, params) {
    const url = '/material_manage/video/check_md5/' + md5;
    return this._httpClient.get(url, params);
  }
  saveVideoInfo(body, params?): any {
    const url = '/material_manage/video/batch_save_video';
    return this._httpClient.post(url, body, params);
  }
  // 上传封面图
  saveCoverImageInfo(body, params?): any {
    const url = '/material_manage/screenshot/save_images';
    return this._httpClient.post(url, body, params);
  }
  saveImageInfo(body, params?): any {
    const url = '/material_manage/image/save_images';
    return this._httpClient.post(url, body, params);
  }
  deleteVideoMaterials(materialId, body, params?): any {
    const url = '/material_manage/video/material/' + materialId;
    return this._httpClient.delete(url, body, params);
  }
  deleteVideoMaterialsBatch(body, params?): any {
    const url = '/material_manage/video/material/batch_delete';
    return this._httpClient.delete(url, body, params);
  }

  // 封面列表
  getMaterialsCoverImageList(cssType, publisherId, body, params?): any {
    const url = "/material_manage/screenshot/get_list";
    return this._httpClient.post(url, body, params);
  }

  // 删除封面图
  deleteCoverImageMaterials(materialId, params?): any {
    const url = '/material_manage/screenshot/image_material/' + materialId;
    return this._httpClient.delete(url, {}, params);
  }

  // 批量删除封面图
  deleteCoverImageMaterialsBatch(body, params?): any {
    const url = '/material_manage/screenshot/image_material/batch_delete';
    return this._httpClient.delete(url, body, params);
  }

  getImageSize(params?): any {
    const url = '/material_manage/image/config';
    return this._httpClient.get(url, params);
  }

  getLabelByLaunchType(tagsType) {
    const url = "/launch_rpa/tags/list";
    return this._httpClient.get(url, { tags_type: tagsType });
  }

  modifyLabel(labelType, body, params?) {
    const url = "/material_manage/" + labelType + "/batch_confirm";
    return this._httpClient.put(url, body, params);
  }

  batchPush(labelType, body, params?) {
    const url = "/material_manage/" + labelType + "/batch_push";
    return this._httpClient.post(url, body, params);
  }


}
