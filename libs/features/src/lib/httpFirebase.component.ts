import { HttpProgressEvent } from '@angular/common/http';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FileTransferDialogComponent } from './file.transfer.dialog.component';
import { Store, Select } from '@ngxs/store';
import { AppConfigService } from '@promatrix/services';
import { FirebaseService } from '@promatrix/services';
import { Simpson } from '@promatrix/services';
import { BookInfo } from '@promatrix/services';
import { RequestHttpDownload, HttpFirebaseInit } from '@promatrix/essentials';
import { HttpFirebaseState, HttpFirebaseStateModel } from './httpFirebase.component.state';
import { Observable, Subscription } from 'rxjs';
import { NotificationHelpDialogComponent } from './notification/notification.component';
@Component({
  // #region template
  templateUrl: './httpFirebase.component.html',
  providers: [FirebaseService],
  // #endregion
})
export class HttpFirebaseComponent implements OnInit, OnDestroy {
  public isViewVisible = false;
  @Select(HttpFirebaseState) selectState: Observable<HttpFirebaseState>;
  private subscription: Subscription;

  constructor(
    private store: Store,
    private readonly ac: AppConfigService, private readonly fb: FirebaseService,
    private readonly dialog: MatDialog) {
    store.dispatch(new HttpFirebaseInit(this.ac.ngAction));
    this.stateChanges();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private stateChanges() {
    this.subscription = this.selectState.subscribe(x => {
      if ((x as undefined as HttpFirebaseStateModel).requestHttpDownload) {
        this.downloadTextFile();
      }
    });
  }

  public ngOnInit() {
    this.ac.waitUntilInitialized(() => {
      setTimeout(() => {
        this.isViewVisible = true;
      }, 0);
    });
  }

  //#region Http Get
  public getAll() {
    this.fb.getAll((simpsons: Array<Simpson>) => {
      this.ac.toastrInfo('Successfully completed GetAll!', -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    });
  }

  public getFromId() {
    this.fb.getFromAge(43, (simpsons: Array<Simpson>) => {
      this.ac.toastrInfo('Successfully completed getFromId!', -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    }, 'tsserver.txt');
  }

  // Keep for reference
  // public getWithProgress() {
  //   this.fb.getWithProgress((successMessage: string) => {
  //     this.ac.toastrInfo(successMessage, -1);
  //   }, (errorMessage: string) => {
  //     this.ac.toastrError(errorMessage);
  //   }, 'tsserver.txt', (event) => {
  //     if (event.loaded < 1024) {
  //       console.log(`Get in progress! ${event.loaded} bytes loaded`);
  //     } else {
  //       const kbDownloaded = Math.round(event.loaded / 1024);
  //       console.log(`Get in progress! ${kbDownloaded}Kb loaded`);
  //     }
  //   });
  // }

  public onClickDownloadTextFile() {
    this.store.dispatch(new RequestHttpDownload('DownloadTxt', 'RequestHttpDownload', true, true, -1));
  }

  public downloadTextFile() {
    const fileName = 'tsserver.txt';
    this.fb.downloadFile((fileBlob: Blob) => {
      this.fb.saveFile(fileBlob, fileName);
      this.ac.toastrInfo('Successfully downloaded: ' + fileName, -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    }, fileName);
  }

  public downloadPdfFile() {
    const fileName = 'merge-4.pdf';
    this.fb.downloadFile((fileBlob: Blob) => {
      this.fb.saveFile(fileBlob, fileName);
      this.ac.toastrInfo('Successfully downloaded: ' + fileName, -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    }, fileName);
  }

  public downloadJson() {
    this.fb.getAll((library: Array<Simpson>) => {
      const stringVal = JSON.stringify(library, null, 2);
      const fileBlob = new Blob([stringVal], { type: 'text/plain' });
      // manually move this file to the assests folder to be used with getJson
      this.fb.saveFile(fileBlob, 'library.json');
      this.ac.toastrInfo('Successfully completed saving Json!', -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    });
  }

  public getLocalJson() {
    this.fb.getAllLocally((library: Array<BookInfo>) => {
      this.ac.toastrInfo('Successfully completed locally getting Json!', -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    });
  }
  //#endregion

  //#region Http Post
  public postEntity() {
    this.fb.postEntity((successMessage) => {
      this.ac.toastrInfo(successMessage, -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    });
  }

  public postCollection() {
    this.fb.postCollection((successMessage) => {
      this.ac.toastrInfo(successMessage, -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    });
  }

  public uploadFiles(element: HTMLInputElement, files: Array<File>) {
    this.fb.uploadFiles(files, (successMessage: string) => {
      element.value = null;
      this.ac.toastrInfo(successMessage, -1);
    }, (errorMessage: string) => {
      element.value = null;
      this.ac.toastrError(errorMessage);
    }, (event: HttpProgressEvent) => {
      if (event.loaded < 1024) {
        console.log(`Post in progress! ${event.loaded} bytes loaded`);
      } else {
        const kbUploaded = Math.round(event.loaded / 1024);
        console.log(`Post in progress! ${kbUploaded}Kb loaded`);
      }
    });
  }

  public uploadWithProgress(element: HTMLInputElement, files: Array<File>) {
    const dialogConfig: MatDialogConfig = { width: '450px', disableClose: true };
    dialogConfig.data = {
      id: 1,
      title: 'Upload: Choose any file to upload',
      description: 'Upload Progress (click Cancel to discontinue)',
      bytesTransfered: 0,
      totalBytes: 0,
      cancel: false,
    };

    const matDialogRef = this.dialog.open(FileTransferDialogComponent, dialogConfig);
    this.fb.uploadFileWithProgess(files, () => {
      setTimeout(() => {
        matDialogRef.close();
        element.value = null;
      }, 1000);
    }, (errorMessage: string) => {
      element.value = null;
      if (!dialogConfig.data.cancel) {
        matDialogRef.close();
        setTimeout(() => {
          this.ac.toastrError(errorMessage);
        }, 500);
        return true;
      }
    }, (bytesTransfered: number, totalBytes: number) => {
      dialogConfig.data.bytesTransfered = Math.round(bytesTransfered / 1000);
      dialogConfig.data.totalBytes = Math.round(totalBytes / 1000);
      dialogConfig.data.percentComplete = 100 / (totalBytes / bytesTransfered);
      if (dialogConfig.data.cancel) {
        matDialogRef.close();
        element.value = null;
        return true;
      }
    });
  }
  //#endregion

  //#region Http Delete
  public deleteEntity() {
    this.fb.deleteEntity((successMessage) => {
      this.ac.toastrInfo(successMessage, -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    }, 1234567899);
  }
  //#endregion

}

@Component({
  templateUrl: './httpFirebase.component.help.html',
})
export class HttpFirebaseHelpDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { debugOnly: boolean, title: string, subtitle: string, show: boolean, helpTemplate: NotificationHelpDialogComponent }) {
    // data contains values passed by the router
  }
}
