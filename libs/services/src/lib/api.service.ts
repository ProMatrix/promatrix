import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { NgAction } from '@promatrix/essentials';
@Injectable()
export class ApiService {
  private readonly serverError = 'Server could be busy or offline!';
  // use downloadTimeout 0 for long polling
  downloadTimeout = 45000;
  ngAction: NgAction;
  timerId: ReturnType<typeof setTimeout>;

  constructor(readonly http: HttpClient, readonly store: Store) {
    this.ngAction = NgAction.getInstance(store);
  }

  private httpRequest(
    obj: object,
    requestType: string,
    responseType: string,
    url: string,
    success: (x: any) => any,
    error: (x: string) => string,
    params?: HttpParams, headers?: HttpHeaders,
    progressCallback?: (x: any) => any) {
    const reportProgress = (progressCallback !== undefined && progressCallback !== null);
    let request: HttpRequest<any>;
    if (obj) {
      request = new HttpRequest(requestType, url, obj, { reportProgress, headers, params });
    } else {
      request = new HttpRequest(
        requestType, url,
        {
          responseType,
          reportProgress,
          headers, params,
        });
    }

    const httpSubscription = this.http.request(request).subscribe((event: HttpEvent<any>) => {
      if (this.timerId) {
        clearTimeout(this.timerId);
      }
      if (this.downloadTimeout > 0) {
        this.timerId = setTimeout(() => {
          clearTimeout(this.timerId);
          this.timerId = null;
          httpSubscription.unsubscribe();
          error(this.serverError);
        }, this.downloadTimeout);
      }

      switch (event.type) {
        case HttpEventType.Sent:
          break;
        case HttpEventType.ResponseHeader:
          break;
        case HttpEventType.DownloadProgress:
          if (requestType === 'Get') {
            if (progressCallback(event)) {
              clearTimeout(this.timerId);
              httpSubscription.unsubscribe();
            }
          }
          break;
        case HttpEventType.UploadProgress:
          if (requestType === 'Post') {
            if (progressCallback(event)) {
              clearTimeout(this.timerId);
              httpSubscription.unsubscribe();
            }
          }
          break;
        case HttpEventType.Response:
          clearTimeout(this.timerId);
          httpSubscription.unsubscribe();
          if (event.body instanceof Blob) {
            success(event);
          } else {
            success(event.body);
          }
          break;
      }
    },
      (errorResponse: HttpErrorResponse) => {
        clearTimeout(this.timerId);
        httpSubscription.unsubscribe();
        if (errorResponse.error) {
          error('Http Error: ' + errorResponse.error);
        } else {
          if (errorResponse.message.length > 0) {
            error(errorResponse.message);
          } else {
            error('Http Error: unknown!');
          }
        }
      },
    );
  }

  get(
    url: string,
    success: (x: any) => any,
    error: (x: string) => any,
    params?: HttpParams,
    headers?: HttpHeaders,
    progressCallback?: (x: any) => any) {
    this.httpRequest(null, 'Get', 'json', url, success, error, params, headers, progressCallback);
  }

  download(
    url: string,
    success: (x: any) => any,
    error: (x: string) => any,
    params?: HttpParams,
    headers?: HttpHeaders,
    progressCallback?: (x: any) => any) {
    this.httpRequest(null, 'Get', 'blob' as 'json', url, success, error, params, headers, progressCallback);
  }

  postload(
    // this is used in cases where you need to send the url to the server in the body, but not in a query string
    // and since it is a post, doesn't support progress
    obj: object,
    url: string,
    success: (x: any) => any,
    error: (x: string) => any,
    params?: HttpParams,
    headers?: HttpHeaders,
    progressCallback?: (x: any) => any) {

    this.http.post(url, obj, {
      responseType: 'blob', headers: new HttpHeaders().append('Content-type', 'application/json')
    }).subscribe((blob: Blob) => {
      success(blob);
    }, (errorResponse: HttpErrorResponse) => {
      error(errorResponse.message);
    });
  }

  post(
    object$: object,
    url: string,
    success: (x: any) => any,
    error: (x: string) => any,
    params?: HttpParams,
    headers?: HttpHeaders,
    progressCallback?: (x: any) => any) {
    this.httpRequest(object$, 'Post', 'json', url, success, error, params, headers, progressCallback);
  }

  upload(
    files: Array<File>,
    url: string,
    success: (x: any) => any,
    error: (x: string) => any,
    params?: HttpParams,
    headers?: HttpHeaders,
    progressCallback?: (x: any) => any) {
    const formData = new FormData();
    for (const file of files) {
      formData.append(file.name, file);
    }
    this.post(formData, url, success, error, params, headers, progressCallback);
  }

  delete(
    url: string,
    success: (x: any) => any,
    error: (x: string) => any,
    params?: HttpParams,
    headers?: HttpHeaders,
    progressCallback?: (x: any) => any) {
    this.httpRequest(null, 'Delete', 'json', url, success, error, params, headers, progressCallback);
  }

  saveFile(blob: Blob, filename: string) {
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      const a = document.createElement('a');
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 0);
    }
  }
}
