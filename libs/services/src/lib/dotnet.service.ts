import { HttpClient, HttpParams, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionFile } from '@promatrix/essentials';
import { ApiService } from './api.service';
import { Store } from '@ngxs/store';
import { BookInfo } from './definitions';
import { Simpson } from './definitions';
import { AppConfigService } from './app-config.service';
import { DotnetRemoteServer } from './environments/dotnet.environments';

@Injectable({ providedIn: 'root' })
export class DotnetService extends ApiService {

  bookLibrary: Array<BookInfo>;
  fileBlob: Blob;
  environment: DotnetRemoteServer;

  constructor(ac: AppConfigService, store: Store, http: HttpClient) {
    super(http, store);
    this.environment = ac.getDotnetEnvironment();
  }

  isDebug() {
    return !this.environment.production;
  }

  getAll(success: (simpsons: Array<Simpson>) => any, error: (x: string) => any) {
    this.get(this.environment.getAll,
      (simpsons: Array<Simpson>) => {
        success(simpsons);
      },
      (errorMessage: string) => {
        error(errorMessage);
      });
  }

  getAllLocally(success: (library: Array<BookInfo>) => any, error: (x: string) => any) {
    this.get(this.environment.getAllLocally,
      (library: Array<BookInfo>) => {
        success(library);
      }, (errorMessage: string) => {
        error(errorMessage);
      });
  }

  getFromId(success: (x: string) => any, error: (x: string) => any, fileName: string) {
    this.get(this.environment.getContent,
      (response: any) => {
        success(response.content);
      }, error, new HttpParams().set('fileName', fileName));
  }

  // keep for reference
  getWithProgress(success: (x: string) => any, error: (x: string) => any, fileName: string, progressCallback?: (x: any) => any) {
    this.get(this.environment.getContent, (response: any) => {
      success(response.content);
    }, error,
      new HttpParams().set('fileName', fileName), null, (event: HttpProgressEvent) => {
        if (progressCallback) {
          progressCallback(event);
        }
      });
  }

  public downloadFile(success: (x: Blob) => any, error: (x: string) => any, fileName: string) {
    this.download(this.environment.download, (response: HttpResponse<any>) => {
      const fileBlob = new Blob([response.body], { type: 'text/plain' });
      success(fileBlob);
    }, error,
      new HttpParams().set('fileName', fileName));
  }

  samplePayload(blob: Blob, type, success: (x: string) => any, error: (x: string) => any) {
    const file = new File([blob], 'simple.txt', { type });

    const files = new Array<File>();
    files.push(file);

    this.upload(files, this.environment.samplePayload, (response: HttpResponse<any>) => {
      success('Successfully completed Upload Payload Sample!');
    }, error, null, null, (event: HttpProgressEvent) => {
    });
  }

  public downloadWithProgress(success: () => any, error: (x: string) => any, fileName: string, progressCallback?: (x: any) => any) {
    this.download(this.environment.download,
      (response: HttpResponse<any>) => {
        this.saveFile(new Blob([response.body]), fileName);
        success();
      },
      error, new HttpParams().set('fileName', fileName), null, (event: HttpProgressEvent) => {
        if (progressCallback) {
          return progressCallback(event);
        }
      });
  }

  public postEntity(success: (x: string) => any, error: (x: string) => any) {
    this.post({ id: 123, name: 'A Bedtime Story', summary: 'BORING...' }, this.environment.postEntity, (response: HttpResponse<any>) => {
      success('Successfully completed Post Entity!');
    }, error);
  }

  public postCollection(success: (x: string) => any, error: (x: string) => any) {
    this.post([{ id: 123, name: 'A Bedtime Story', summary: 'BORING...' },
    { id: 456, name: 'An Endless Story', summary: 'Endless...' },
    { id: 789, name: 'Happy Ever After', summary: 'Exciting...' }],
    this.environment.postCollection, (response: HttpResponse<any>) => {
        success('Successfully completed Post Collection!');
      }, error);
  }

  public postCollectionWithProgess(success: (x: string) => any, error: (x: string) => any, progressCallback?: (x: any) => any) {
    const collection = [{ id: 123, name: 'A Bedtime Story', summary: 'BORING...' },
    { id: 456, name: 'An Endless Story', summary: 'Endless...' },
    { id: 789, name: 'Happy Ever After', summary: 'Exciting...' }];
    this.post(collection, this.environment.postCollection, (response: HttpResponse<any>) => {
      success('Successfully completed Post with Progress!');
    }, error, null, null, (event: HttpProgressEvent) => {
      if (progressCallback) {
        progressCallback(event);
      }
    });
  }

  public uploadFile(files: Array<File>, success: (x: string) => any, error: (x: string) => any, progressCallback?: (x: any) => any) {
    this.upload(files, this.environment.upload, (response: HttpResponse<any>) => {
      success('Successfully completed Upload Files(s)!');
    }, error, null, null, (event: HttpProgressEvent) => {
      if (progressCallback) {
        progressCallback(event);
      }
    });
  }

  public uploadFileWithProgess(files: Array<File>, success: () => any, error: (x: string) => any, progressCallback?: (x: any) => any) {
    this.upload(files, this.environment.upload, () => {
      success();
    }, error, null, null, (event: HttpProgressEvent) => {
      if (progressCallback) {
        return progressCallback(event);
      }
    });
  }

  public deleteEntity(success: (x: string) => any, error: (x: string) => any, id: string) {
    this.delete(this.environment.deleteEntity,
      (response: HttpResponse<any>) => {
        success('Successfully deleted entity!');
      }, error, new HttpParams().set('id', id));
  }

  saveActionsQueue(success: (x: string) => any, error: (x: string) => any) {
    const jsonString = JSON.stringify(this.ngAction.actionsQueue);
    this.post({ fileName: 'actionsQueue003.json', actionsQueue: jsonString },
    this.environment.saveActionsQueue, (response: HttpResponse<any>) => {
        success('Successfully saved the Actions Queue!');
      }, error);
  }

  loadActionsQueue(success: (x: string) => any, error: (x: string) => any, fileName: string) {
    fileName = 'actionsQueue003.json';
    this.get(this.environment.loadActionsQueue,
      (actionFile: ActionFile) => {
        const actionsQueue = JSON.parse(actionFile.actionsQueue);
        this.ngAction.replaceActionsQueue(actionsQueue);
        success('Successfully loaded: ' + fileName);
      }, error, new HttpParams().set('fileName', fileName));
  }
}
