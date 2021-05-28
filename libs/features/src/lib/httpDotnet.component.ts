import { HttpProgressEvent } from '@angular/common/http';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FileTransferDialogComponent } from './file.transfer.dialog.component';
import { Store, Select } from '@ngxs/store';
import { AppConfigService } from '@promatrix/services';
import { BookInfo }  from '@promatrix/services';
import { Simpson }  from '@promatrix/services';
import { RequestHttpDownload, HttpDotnetInit } from '@promatrix/essentials'
import { HttpDotnetState, HttpDotnetStateModel } from './httpDotnet.component.state';
import { Observable, Subscription } from 'rxjs';
import { DotnetService } from '@promatrix/services';
import { NotificationHelpDialogComponent } from './notification/notification.component';
@Component({
  templateUrl: './httpDotnet.component.html',
  providers: [DotnetService],
})
export class HttpDotnetComponent implements OnInit, OnDestroy {
  isViewVisible = false;
  @Select(HttpDotnetState) selectState: Observable<HttpDotnetState>;
  private subscription: Subscription;

  constructor(
    private store: Store,
    private readonly ac: AppConfigService, private readonly dn: DotnetService,
    private readonly dialog: MatDialog) {

    store.dispatch(new HttpDotnetInit(this.ac.ngAction));
    this.stateChanges();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private stateChanges() {
    this.subscription = this.selectState.subscribe(x => {
      if ((x as undefined as HttpDotnetStateModel).requestHttpDownload) {
        this.downloadTextFile();
      }
    });
  }

  ngOnInit() {
    this.ac.waitUntilInitialized(() => {
      setTimeout(() => {
        this.isViewVisible = true;
      }, 0);
    });
  }

  //#region Http Get
  getAll() {
    this.dn.getAll((simpsons: Array<Simpson>) => {
      this.ac.toastrInfo('Successfully completed GetAll!', -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    });
  }

  getFromId() {
    this.dn.getFromId((textMessage: string) => {
      this.ac.toastrInfo(textMessage, -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    }, 'tsserver.txt');
  }

  getWithProgress() {
    this.dn.getWithProgress((successMessage: string) => {
      this.ac.toastrInfo(successMessage, -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    }, 'tsserver.txt', (event) => {
      if (event.loaded < 1024) {
        console.log(`Get in progress! ${event.loaded} bytes loaded`);
      } else {
        const kbDownloaded = Math.round(event.loaded / 1024);
        console.log(`Get in progress! ${kbDownloaded}Kb loaded`);
      }
    });
  }

  onClickDownloadTextFile() {
    this.store.dispatch(new RequestHttpDownload('DownloadTxt', 'RequestHttpDownload', true, true, -1));
  }

  downloadTextFile() {
    const fileName = 'tsserver.txt';
    this.dn.downloadFile((fileBlob: Blob) => {
      this.dn.saveFile(fileBlob, fileName);
      this.ac.toastrInfo('Successfully downloaded: ' + fileName);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    }, fileName);
  }

  downloadPdfFile() {
    const fileName = 'merge-4.pdf';
    this.dn.downloadFile((fileBlob: Blob) => {
      this.dn.saveFile(fileBlob, fileName);
      this.ac.toastrInfo('Successfully downloaded: ' + fileName, -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    }, fileName);
  }

  downloadPdfWithProgress() {
    const dialogConfig: MatDialogConfig = { width: '450px', disableClose: true };
    dialogConfig.data = {
      id: 1,
      title: 'Download: ProASPNetCoreMVC.pdf',
      description: 'Download Progress (click Cancel to discontinue)',
      bytesTransfered: 0,
      totalBytes: 0,
      cancel: false,
    };

    const matDialogRef = this.dialog.open(FileTransferDialogComponent, dialogConfig);
    this.dn.downloadWithProgress(() => {
      setTimeout(() => { matDialogRef.close(); }, 1000);
    }, (errorMessage: string) => {
      if (!dialogConfig.data.cancel) {
        matDialogRef.close();
        setTimeout(() => {
          this.ac.toastrError(errorMessage);
        }, 500);
        return true;
      }
    }, 'ProASPNetCoreMVC.pdf', (event: HttpProgressEvent) => {
      dialogConfig.data.bytesTransfered = Math.round(event.loaded / 1000);
      dialogConfig.data.totalBytes = Math.round(event.total / 1000);
      dialogConfig.data.percentComplete = 100 / (event.total / event.loaded);
      if (dialogConfig.data.cancel) {
        matDialogRef.close();
        return true;
      }
    });
  }

  downloadJson() {
    this.dn.getAll((library: Array<Simpson>) => {
      const stringVal = JSON.stringify(library, null, 2);
      const fileBlob = new Blob([stringVal], { type: 'text/plain' });
      // manually move this file to the assests folder to be used with getJson
      this.dn.saveFile(fileBlob, 'library.json');
      this.ac.toastrInfo('Successfully completed saving Json!', -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    });
  }

  getLocalJson() {
    this.dn.getAllLocally((library: Array<BookInfo>) => {
      this.ac.toastrInfo('Successfully completed locally getting Json!', -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    });
  }

  getJson() {
    this.dn.getAllLocally((library: Array<BookInfo>) => {
      this.ac.toastrInfo('Successfully completed locally getting Json!', -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    });
  }
  //#endregion

  //#region Http Post
  postEntity() {
    this.dn.postEntity((successMessage) => {
      this.ac.toastrInfo(successMessage, -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    });
  }

  postCollection() {
    this.dn.postCollection((successMessage) => {
      this.ac.toastrInfo(successMessage, -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    });
  }

  postCollectionWithProgess() {
    this.dn.postCollectionWithProgess((successMessage) => {
      this.ac.toastrInfo(successMessage, -1);
    }, (errorMessage: string) => {
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

  uploadFiles(element: HTMLInputElement, files: Array<File>) {
    this.dn.uploadFile(files, (successMessage: string) => {
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

  uploadWithProgress(element: HTMLInputElement, files: Array<File>) {
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
    this.dn.uploadFileWithProgess(files, () => {
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
    }, (event: HttpProgressEvent) => {
      dialogConfig.data.bytesTransfered = Math.round(event.loaded / 1000);
      dialogConfig.data.totalBytes = Math.round(event.total / 1000);
      dialogConfig.data.percentComplete = 100 / (event.total / event.loaded);
      if (dialogConfig.data.cancel) {
        matDialogRef.close();
        element.value = null;
        return true;
      }
    });
  }
  //#endregion

  //#region Http Delete
  deleteEntity() {
    this.dn.deleteEntity((successMessage) => {
      this.ac.toastrInfo(successMessage, -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    }, '1492');
  }
  //#endregion

}

@Component({
  templateUrl: './httpDotnet.component.help.html',
})
export class HttpDotnetHelpDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { debugOnly: boolean, title: string, subtitle: string, show: boolean, helpTemplate: NotificationHelpDialogComponent }) {
    // data contains values passed by the router
  }
}
