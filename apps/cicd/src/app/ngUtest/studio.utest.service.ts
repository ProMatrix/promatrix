import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { StudioAppService } from '../studio.app.service';
import { AngularProject, BuildResponse } from 'ngx-modelling';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment.dev';
import { CicdRemoteServer } from '@promatrix/services';

@Injectable({ providedIn: 'root' })
export class StudioUtestService extends StudioAppService {
  uTestCompleted = true;
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
      .angularProjects.filter((angularProject) => angularProject.uTestEnabled === true);
    this.processProjectLoop(success, error);
  }

  processProjectLoop(success: (s: string) => void, error: (e: string) => void): void {
    this.nextProject((s: string) => {
      if (this.projectQueue.length === 0) {
        this.uTestCompleted = true;
        success(s);
      } else {
        this.processProjectLoop(success, error);
      }
    }, (e: string) => {
      this.uTestCompleted = true;
      error(e);
    });
  }

  private nextProject(success: (s: string) => void, error: (e: string) => void): void {
    if (this.projectQueue.length === 0) {
      this.uTestCompleted = true;
      success(`BUT NO PROJECTS!`);
      return;
    }
    this.uTestCompleted = false;
    const angularProject = this.projectQueue.shift();
    angularProject.ngUtestProcess.processing = true;
    angularProject.ngUtestProcess.completed = false;
    // cloning collection
    this.scriptQueue = angularProject.ngUtestProcess.npmScripts.filter(() => true);
    this.successQueue = angularProject.ngUtestProcess.npmSuccesses.filter(() => true);
    this.failureQueue = angularProject.ngUtestProcess.npmFailures.filter(() => true);
    this.processScriptLoop(angularProject, success, error);
  }

  processScriptLoop(angularProject: AngularProject, success: (s: string) => void, error: (e: string) => void): void {
    this.nextScript(angularProject, (s: string) => {
      if (this.scriptQueue.length === 0) {
        angularProject.ngUtestProcess.succeeded = true;
        angularProject.ngUtestProcess.completed = true;
        angularProject.ngUtestProcess.processing = false;
        angularProject.ngUtestProcess.processInfoType = '';
        angularProject.ngUtestProcess.processInfoMessage = '';
        this.uTestCompleted = true;
        success(s);
      } else {
        this.processScriptLoop(angularProject, success, error);
      }
    }, (e: string) => {
      angularProject.ngUtestProcess.succeeded = false;
      angularProject.ngUtestProcess.completed = true;
      angularProject.ngUtestProcess.processing = false;
      error(e);
    });

  }

  private nextScript(angularProject: AngularProject, success: (s: string) => void, error: (e: string) => void) {
    if (this.scriptQueue.length === 0) {
      this.uTestCompleted = true;
      success(`BUT NO SCRIPTS!`);
      return;
    }

    const npmScript = this.scriptQueue.shift();
    const npmSuccess = this.successQueue.shift();
    const npmFailure = this.failureQueue.shift();
    angularProject.ngUtestProcess.processInfoType = 'npm Script: ';
    angularProject.ngUtestProcess.processInfoMessage = npmScript;
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
        angularProject.ngUtestProcess.succeeded = true;

        angularProject.ngUtestProcess.statusMessage = '\r--- ' + angularProject.ngUtestProcess.processInfoType + angularProject.npmScript +
          '\r\r' + buildResponse.statusMessage;
        success('SUCCESS!');
        // }
      } else {
        angularProject.ngUtestProcess.succeeded = false;
        angularProject.ngUtestProcess.processInfoType = 'npm Script:';
        angularProject.ngUtestProcess.processInfoMessage = npmScript;
        angularProject.ngUtestProcess.statusMessage = '\r--- ' + angularProject.ngUtestProcess.processInfoType + angularProject.npmScript +
          '\r\r' + buildResponse.statusMessage;
        const errorMessage = `Error: ${angularProject.ngEtestProcess.processInfoType} ${npmScript} failed!`
        error(errorMessage);
      }

    }, () => {
      angularProject.ngUtestProcess.succeeded = false;
      angularProject.ngUtestProcess.processInfoType = 'npm Script:';
      angularProject.ngUtestProcess.processInfoMessage = npmScript;
      error('Unhandled Exception: from Local NgServer!');
    });
  }
}
