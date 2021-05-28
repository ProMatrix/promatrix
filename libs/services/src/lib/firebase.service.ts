import { HttpClient, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { from } from 'rxjs';
import { BookInfo } from './definitions';
import { Simpson } from './definitions';
import { Store } from '@ngxs/store';
import { AppConfigService } from './app-config.service';
import { FirebaseRemoteServer } from './environments/firebase.environments';

@Injectable({ providedIn: 'root' })
export class FirebaseService extends ApiService {

  bookLibrary: Array<BookInfo>;
  fileBlob: Blob;
  environment: FirebaseRemoteServer;

  constructor(ac: AppConfigService, store: Store, http: HttpClient, private db: AngularFirestore, private storage: AngularFireStorage) {
    super(http, store);
    this.environment = ac.getFirebaseEnvironment();
  }

  isDebug() {
    return !this.environment.production;
  }

  getAll(success: (simpsons: Array<Simpson>) => any, error: (x: string) => any) {
    from(this.db.collection(`simpsons`).valueChanges()).subscribe(
      (simpsons: Array<Simpson>) => {
        success(simpsons);
      },
      err => {
        error(err.message);
      }
    );
  }

  getAllLocally(success: (library: Array<BookInfo>) => any, error: (x: string) => any) {
    this.get(this.environment.getAllLocally,
      (library: Array<BookInfo>) => {
        success(library);
      }, (errorMessage: string) => {
        error(errorMessage);
      });
  }

  getFromAge(age: number, success: (simpsons: Array<Simpson>) => any, error: (x: string) => any, fileName: string) {

    from(this.db.collection(`simpsons`, ref => ref.where('age', '==', age)).valueChanges()).subscribe(
      (simpsons: Array<Simpson>) => {
        success(simpsons);
      },
      err => {
        error(err.message);
      }
    );
  }

  // keep for reference
  // getWithProgress(success: (x: string) => any, error: (x: string) => any, fileName: string, progressCallback?: (x: any) => any) {
  //   this.get(environment.api.getContent, (response: any) => {
  //     success(response.content);
  //   }, error,
  //     new HttpParams().set('fileName', fileName), null, (event: HttpProgressEvent) => {
  //       if (progressCallback) {
  //         progressCallback(event);
  //       }
  //     });
  // }

  downloadFile(success: (x: Blob) => any, error: (x: string) => any, fileName: string) {
    const storageRef = this.storage.ref(`myBucket/${fileName}`);
    storageRef.getDownloadURL().subscribe(fileUrl => {

      // const url = 'https://us-central1-ngx-studio-desktop.cloudfunctions.net/index/download'
      const obj = { fileName, fileUrl };

      this.postload(obj, this.environment.download, (blob: Blob) => {
        success(blob);
      }, errorMessage => {
        error(errorMessage);
      }
      );
    }, err => {
      error(err.message);
    });
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

  postEntity(success: (x: string) => any, error: (x: string) => any) {
    const id = 1234567890;
    const data = { id, name: 'A Bedtime Story', summary: 'BORING...' };
    from(this.db.doc(`novel/${id}`).set(data)).subscribe(
      () => {
        success('Successfully completed Post Entity!');
      },
      err => {
        error(err.message);
      }
    );
  }

  postCollection(success: (x: string) => any, error: (x: string) => any) {
    const id = 9876543210;
    const data = {
      books: [{ name: 'A Bedtime Story', summary: 'BORING...' },
      { name: 'An Endless Story', summary: 'Endless...' },
      { name: 'Happy Ever After', summary: 'Exciting...' }]
    };

    from(this.db.doc(`library/${id}`).set(data)).subscribe(
      () => {
        success('Successfully completed Post Entity!');
      },
      err => {
        error(err.message);
      }
    );
  }

  uploadFiles(files: Array<File>, success: (x: string) => any, error: (x: string) => any, progressCallback?: (x: any) => any) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `myBucket/${file.name}`;
      const task = this.storage.upload(filePath, file);
      task.percentageChanges()
        .subscribe(x => {
          if (x === 100 && i === files.length - 1) {
            success('Successfully completed Upload Files(s)!');
          }
        },
          err => {
            error(err.message);
          }
        );
    }
  }

  uploadFileWithProgess(files: Array<File>, success: () => any, error: (x: string) => any, progressCallback?: (bytesTransferred: number, totalBytes: number) => any) {
    const file = files[0];
    const filePath = `myBucket/${file.name}`;
    const task = this.storage.upload(filePath, file);
    task.snapshotChanges()
      .subscribe(x => {
        if (progressCallback) {
          progressCallback(x.bytesTransferred, x.totalBytes);
        }
        if (x.bytesTransferred === x.totalBytes) {
          success();
        }
      },
        err => {
          error(err.message);
        }
      );
  }

  deleteEntity(success: (x: string) => any, error: (x: string) => any, id: number) {
    // id should exist, but if it did, this would delete it
    from(this.db.doc(`novel/${id}`).delete()).subscribe(
      () => {
        success('Successfully completed deleted Entity!');
      },
      err => {
        error(err.message);
      }
    );
  }

  saveActionsQueue(success: (x: string) => any, error: (x: string) => any, progressCallback?: (x: any) => any) {
    const fileName = 'actionsQueue003.json';
    const s = JSON.stringify(this.ngAction.actionsQueue);
    const file = new File([s], fileName, {type: 'application/json'});
    const filePath = `myBucket/actions/${fileName}`;
    const task = this.storage.upload(filePath, file);
    task.percentageChanges()
    .subscribe(x => {
      if (x === 100) {
        success('Successfully saved: ' + fileName);
      }
    },
      err => {
        error(err.message);
      }
    );
  }

  loadActionsQueue(success: (x: string) => any, error: (x: string) => any, fileName: string) {
    fileName = 'actionsQueue003.json';
    const storageRef = this.storage.ref(`myBucket/actions/${fileName}`);
    storageRef.getDownloadURL().subscribe(fileUrl => {
      const obj = { fileName, fileUrl };
      this.postload(obj, this.environment.download, (blob: Blob) => {
        try {
          blob.text().then(x => {
            const actionsQueue = JSON.parse(x);
            this.ngAction.replaceActionsQueue(actionsQueue);
            success('Successfully loaded: ' + fileName);
          }
          );
        } catch (error) {
          const x = 0;
        }
      }, errorMessage => {
        error(errorMessage);
      }
      );
    }, err => {
      error(err.message);
    });
  }
}
