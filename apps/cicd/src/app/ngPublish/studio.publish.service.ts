import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { StudioAppService } from '../studio.app.service';
import { AngularProject, BuildResponse, PackageJson } from 'ngx-modelling';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment.dev';
import { CicdRemoteServer } from '@promatrix/services';

@Injectable({ providedIn: 'root' })
export class StudioPublishService extends StudioAppService {
  publishCompleted = true;
  appServer: CicdRemoteServer;

  constructor(
    public store: Store,
    public http: HttpClient,
    public snackBar: MatSnackBar
  ) {
    super(store, http, snackBar);
    this.downloadTimeout = 300000;
    this.appServer = new CicdRemoteServer(environment.production);
  }

  processAngularProjects(success: (s: string) => void, error: (e: string) => void): void {
    this.projectQueue = this.bc.visualProject.developerSettings
      .angularProjects.filter((angularProject) => angularProject.publishEnabled === true);
    this.processProjectLoop(success, error);
  }

  processProjectLoop(success: (s: string) => void, error: (e: string) => void): void {
    this.nextProject(() => {
      if (this.projectQueue.length === 0) {
        this.publishCompleted = true;
        this.get(this.appServer.getVersion, (json: PackageJson) => {
          success(json.version);
        }, (e: string) => {
          error(e);
        });
      } else {
        this.processProjectLoop(success, error);
      }
    }, (e: string) => {
      this.publishCompleted = true;
      error(e);
    });
  }

  private nextProject(success: (s: string) => void, error: (e: string) => void) {
    if (this.projectQueue.length === 0) {
      this.publishCompleted = true;
      success(`BUT NO PROJECTS!`);
      return;
    }
    this.publishCompleted = false;
    const angularProject = this.projectQueue.shift();
    angularProject.ngPublishProcess.processing = true;
    angularProject.ngPublishProcess.completed = false;
    // cloning collection
    this.scriptQueue = angularProject.ngPublishProcess.npmScripts.filter(() => true);
    this.successQueue = angularProject.ngPublishProcess.npmSuccesses.filter(() => true);
    this.failureQueue = angularProject.ngPublishProcess.npmFailures.filter(() => true);
    this.processScriptLoop(angularProject, success, error);
  }

  processScriptLoop(angularProject: AngularProject, success: (s: string) => void, error: (e: string) => void): void {
    this.nextScript(angularProject, (s: string) => {
      if (this.scriptQueue.length === 0) {
        angularProject.ngPublishProcess.succeeded = true;
        angularProject.ngPublishProcess.completed = true;
        angularProject.ngPublishProcess.processing = false;
        angularProject.ngPublishProcess.processInfoType = '';
        angularProject.ngPublishProcess.processInfoMessage = '';
        this.publishCompleted = true;
        success(s);
      } else {
        this.processScriptLoop(angularProject, success, error);
      }
    }, (e: string) => {
      angularProject.ngPublishProcess.succeeded = false;
      angularProject.ngPublishProcess.completed = true;
      angularProject.ngPublishProcess.processing = false;
      error(e);
    });

  }

  private nextScript(angularProject: AngularProject, success: (s: string) => void, error: (e: string) => void) {
    if (this.scriptQueue.length === 0) {
      this.publishCompleted = true;
      success(`BUT NO SCRIPTS!`);
      return;
    }

    const npmScript = this.scriptQueue.shift();
    const npmSuccess = this.successQueue.shift();
    const npmFailure = this.failureQueue.shift();
    angularProject.ngPublishProcess.processInfoType = 'npm Script: ';
    angularProject.ngPublishProcess.processInfoMessage = npmScript;
    angularProject.npmScript = npmScript;
    angularProject.npmSuccess = npmSuccess;
    angularProject.npmFailure = npmFailure;

    if (npmScript.indexOf('nx:art') !== -1) {
      angularProject.environmentArt = this.appServer.environmentArt;
    } else {
      angularProject.environmentArt = null;
    }
    
    if (npmScript.indexOf('envCwd') !== -1) {
      angularProject.environmentCwd = this.appServer.environmentCwd;
    } else {
      angularProject.environmentCwd = null;
    }
    this.post(angularProject, this.appServer.ngExecuteCommand, (buildResponse: BuildResponse) => {
      if (buildResponse.payloadType === 'completed') {
        angularProject.ngPublishProcess.succeeded = true;

        angularProject.ngPublishProcess.statusMessage = '\r--- ' +
          angularProject.ngPublishProcess.processInfoType + angularProject.npmScript +
          '\r\r' + buildResponse.statusMessage;
        success('SUCCESS!');
        // }
      } else {
        angularProject.ngPublishProcess.succeeded = false;
        angularProject.ngPublishProcess.processInfoType = 'npm Script:';
        angularProject.ngPublishProcess.processInfoMessage = npmScript;
        angularProject.ngPublishProcess.statusMessage = '\r--- ' +
          angularProject.ngPublishProcess.processInfoType + angularProject.npmScript +
          '\r\r' + buildResponse.statusMessage;
          const errorMessage = `Error: ${angularProject.ngEtestProcess.processInfoType} ${npmScript} failed!`
          error(errorMessage);
      }

    }, () => {
      angularProject.ngPublishProcess.succeeded = false;
      angularProject.ngPublishProcess.processInfoType = 'npm Script:';
      angularProject.ngPublishProcess.processInfoMessage = npmScript;
      error('Unhandled Exception: from Local NgServer!');
    });
  }
}
