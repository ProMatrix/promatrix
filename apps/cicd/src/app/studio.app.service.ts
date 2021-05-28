import { Injectable } from '@angular/core';
import { ApiService } from '@promatrix/services';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { AngularProject, BuildConfiguration, BuildResponse, VisualProject } from 'ngx-modelling';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../environments/environment.dev';
import { CicdRemoteServer } from '@promatrix/services';

@Injectable({
  providedIn: 'root',
})
export class StudioAppService extends ApiService {
  bc = new BuildConfiguration();
  projectQueue: Array<AngularProject>;
  scriptQueue: Array<string>;
  successQueue: Array<string>;
  failureQueue: Array<string>;
  vsProject = new VisualProject();
  appServer: CicdRemoteServer;

  constructor(
    public store: Store,
    public http: HttpClient,
    public snackBar: MatSnackBar
  ) {
    super(http, store);
    this.downloadTimeout = 60000;
    this.appServer = new CicdRemoteServer(environment.production);
  }

  getLocalServerCwd(success: (x: string) => void, error: (x: string) => void): void {
    this.get(this.appServer.getLocalServerCwd,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (json: any) => {
        success(json.message);
      }, () => {
        error('Error: Unknown HTTP error!');
      });
  }

  getBuildConfig(success: () => void, error: (x: string) => void): void {
    this.get(`${this.appServer.getConfig}/${this.appServer.environmentCwd}`, (bc: BuildConfiguration) => {
      this.bc = bc;
      success();
    }, (errorMessage: string) => { error(errorMessage); });
  }

  saveDeveloperSetttings(success: () => unknown, error: (x: string) => unknown): void {
    this.post(this.bc.visualProject.developerSettings, this.appServer.saveDeveloperSetttings, () => {
      success();
    }, () => {
      error('Error: Problems saving changes! Could be that the server is not available.');
    });
  }

  toastrSuccess(message: string, duration?: number): void {
    if (!duration) {
      duration = 3000;
    }
    this.snackBar.open(message, 'X', {
      duration,
      panelClass: ['snackbar-success'],
    });
  }

  toastrError(message: string, duration?: number): void {
    if (!duration) {
      duration = -1;
    }

    this.snackBar.open(message, 'X', {
      duration,
      panelClass: ['snackbar-error'],
    });
    setTimeout(() => {
      const toastr = document.querySelector('.mat-snack-bar-container') as HTMLElement;
      toastr.style.maxWidth = '100%';
    }, 0);
  }

  toastrWarning(message: string, duration?: number): void {
    if (!duration) {
      duration = 3000;
    }
    this.snackBar.open(message, 'X', {
      duration,
      panelClass: ['snackbar-warning'],
    });
  }

  toastrInfo(message: string, duration?: number): void {
    if (!duration) {
      duration = 3000;
    }
    this.snackBar.open(message, 'X', {
      duration,
      panelClass: ['snackbar-info'],
    });
  }

  runScript(angularProject: AngularProject, success: (s: string) => void, error: (e: string) => void): void {
    this.post(angularProject, this.appServer.ngProcessScript, (buildResponse: BuildResponse) => {
      if (buildResponse.payloadType === 'completed') {
        return;
      } else {
        error(buildResponse.statusMessage);
      }

    }, () => {
      error('Unhandled Exception: from Local NgServer!');
    });
  }
}
