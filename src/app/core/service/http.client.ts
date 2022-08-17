
import {of as observableOf,  Observable } from 'rxjs';
// tslint:disable:no-console class-name
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { tap ,  catchError } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import {Router} from "@angular/router";


/**
 * 封装HttpClient，主要解决：
 * + 优化HttpClient在参数上便利性
 * + 统一实现 loading
 * + 统一处理时间格式问题
 */
@Injectable()
export class HttpClientService {

  private environment:any = {
    SERVER_API_URL:'',
    SERVER_API_URL_v6:'',
  };

  constructor(
    private http: HttpClient, private message: NzMessageService, private router: Router, @Inject('environment') environment) {
      if (environment) {
        this.environment = environment;
      }
  }

  private _loading = false;

  /** 是否正在加载中 */
  get loading(): boolean {
    return this._loading;
  }

  parseParams(params: any): HttpParams {
    let ret = new HttpParams();
    if (params) {
      // tslint:disable-next-line:forin
      for (const key in params) {
        const _data = params[key];
        ret = ret.set(key, _data);
      }
    }
    return ret;
  }

  appliedUrl(url: string, params?: any) {
    if (!params) {
      return url;
    }
    url += url.indexOf('?') ? '#' : '&';
    // tslint:disable-next-line:forin
    for (const key in params) {
      url += `${key}=${params[key]}`;
    }
    return url;
  }

  private begin() {
    this._loading = true;
  }

  private end() {
    this._loading = false;
  }

  /** 服务端URL地址 */
  get SERVER_URL(): string {
    return this.environment.SERVER_API_URL;
  }

  /**
   * `get` 请求
   *
   * @param {string} url URL地址
   * @param {*} [params] 请求参数
   */
  get(url: string, params?: any): Observable<any> {
    this.begin();
    if (url.indexOf('http') === -1 && url.indexOf('//') === -1) {
      url = this.SERVER_URL + url;
    }

    return this.http
      .get(url, {
        params: this.parseParams(params),
        withCredentials: true
      })
      .pipe(
        tap(() => this.end()),
        catchError((res) => {
          this.end();
          if (res.status === 401) {
            this.message.error('权限发生变更或登陆失效，请重新登陆', {nzDuration: 3000});
            this.router.navigateByUrl('/login');
          }
          return observableOf({status_code: res.status});
        })
      );
  }

  /**
   * `post` 请求
   *
   * @param {string} url URL地址
   * @param {*} [body] body内容
   * @param {*} [params] 请求参数
   */
  post(url: string, body?: any, params?: any): Observable<any> {
    this.begin();
    url = this.SERVER_URL + url;
    return this.http
      .post(url, body || null, {
        params: this.parseParams(params),
        withCredentials: true
      })
      .pipe(
        tap(() => this.end()),
        catchError((res) => {
          return observableOf({status_code: res.status});
        })
      );
  }

  /**
   * `delete` 请求
   *
   * @param {string} url URL地址
   * @param {*} [body] 请求参数
   * @param {*} [params] 请求参数
   */
  delete(url: string, body?: any, params?: any): Observable<any> {
    this.begin();
    url = this.SERVER_URL + url;
    return this.http
      .request('DELETE', url, {
        body: body,
        params: this.parseParams(params),
        withCredentials: true

      })
      .pipe(
        tap(() => this.end()),
        catchError((res) => {
          this.end();
          return observableOf({status_code: res.status});
        })
      );
  }

  /**
   * `jsonp` 请求
   *
   * @param {string} url URL地址
   * @param {*} [params] 请求参数
   * @param {string} [callbackParam] CALLBACK值，默认：JSONP_CALLBACK
   */
  jsonp(url: string, params?: any, callbackParam: string = 'JSONP_CALLBACK'): Observable<any> {
    this.begin();
    url = this.SERVER_URL + url;
    return this.http
      .jsonp(this.appliedUrl(url, params), callbackParam)
      .pipe(
        tap(() => this.end()),
        catchError((res) => {
          this.end();
          return res;
        })
      );
  }

  /**
   * `patch` 请求
   *
   * @param {string} url URL地址
   * @param {*} [body] 请求参数
   */
  patch(url: string, body?: any): Observable<any> {
    this.begin();
    url = this.SERVER_URL + url;
    return this.http.patch(url, body, {withCredentials: true})
      .pipe(
        tap(() => this.end()),
        catchError((res) => {
          this.end();
          return observableOf({status_code: res.status});
        })
      );
  }

  /**
   * `put` 请求
   *
   * @param {string} url URL地址
   * @param {*} [body] 请求参数
   */
  put(url: string, body?: any, params?: any): Observable<any> {
    this.begin();
    if (url.indexOf('http') === -1 && url.indexOf('//') === -1) {
      url = this.SERVER_URL + url;
    }
    return this.http.put(url, body, {
      params: this.parseParams(params),
      withCredentials: true
    }
    )
      .pipe(
        tap(() => this.end()),
        catchError((res) => {
          this.end();
          return observableOf({status_code: res.status});
        })
      );
  }

  /**
   * `request` 请求
   *
   * @param {string} method 请求方法类型
   * @param {string} url URL地址
   * @param {*} [options] 参数
   */
  request(method: string, url: string, options?: {
    body?: any;
    headers?: HttpHeaders | {
      [header: string]: string | string[];
    };
    observe?: 'body' | 'events' | 'response';
    params?: HttpParams | {
      [param: string]: string | string[];
    };
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
    reportProgress?: boolean;
    withCredentials?: boolean;
  }): Observable<any> {
    this.begin();
    url = this.SERVER_URL + url;
    return this.http.request(method, url, options)
      .pipe(
        tap((event) => {

        return  this.end();
        }),
        catchError((res) => {
          this.end();
          // console.log(res);
          // if (res.status === 413) {
          //   this.message.error('上传文件过大，请重新上传', {nzDuration: 1000});
          // }
          return res;
        })
      );
  }
}
