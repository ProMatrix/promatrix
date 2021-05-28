import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { StudioAppService } from '../studio.app.service';
import { AngularProject, BuildResponse } from 'ngx-modelling';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment.dev';
import { CicdRemoteServer } from '@promatrix/services';

@Injectable({ providedIn: 'root' })
export class StudioBuildService extends StudioAppService {
  buildCompleted = true;
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
    this.projectQueue = this.bc.visualProject.developerSettings.angularProjects
      .filter((angularProject) => angularProject.buildEnabled === true);
    this.processProjectLoop(success, error);
  }

  processProjectLoop(success: (s: string) => void, error: (e: string) => void): void {
    this.nextProject((s: string) => {
      if (this.projectQueue.length === 0) {
        this.buildCompleted = true;
        success(s);
      } else {
        this.processProjectLoop(success, error);
      }
    }, (e: string) => {
      this.buildCompleted = true;
      error(e);
    });
  }

  private nextProject(success: (s: string) => void, error: (e: string) => void) {
    if (this.projectQueue.length === 0) {
      this.buildCompleted = true;
      success(`BUT NO PROJECTS!`);
      return;
    }
    this.buildCompleted = false;
    const angularProject = this.projectQueue.shift();
    angularProject.ngBuildProcess.processing = true;
    angularProject.ngBuildProcess.completed = false;
    // cloning collection
    this.scriptQueue = angularProject.ngBuildProcess.npmScripts.filter(() => true);
    this.successQueue = angularProject.ngBuildProcess.npmSuccesses.filter(() => true);
    this.failureQueue = angularProject.ngBuildProcess.npmFailures.filter(() => true);
    this.processScriptLoop(angularProject, success, error);
  }

  processScriptLoop(angularProject: AngularProject, success: (s: string) => void, error: (e: string) => void): void {
    this.nextScript(angularProject, (s: string) => {
      if (this.scriptQueue.length === 0) {
        angularProject.ngBuildProcess.succeeded = true;
        angularProject.ngBuildProcess.completed = true;
        angularProject.ngBuildProcess.processing = false;
        angularProject.ngBuildProcess.processInfoType = '';
        angularProject.ngBuildProcess.processInfoMessage = '';
        this.buildCompleted = true;
        success(s);
      } else {
        this.processScriptLoop(angularProject, success, error);
      }
    }, (e: string) => {
      angularProject.ngBuildProcess.succeeded = false;
      angularProject.ngBuildProcess.completed = true;
      angularProject.ngBuildProcess.processing = false;
      error(e);
    });

  }

  private nextScript(angularProject: AngularProject, success: (s: string) => void, error: (e: string) => void) {
    if (this.scriptQueue.length === 0) {
      this.buildCompleted = true;
      success(`BUT NO SCRIPTS!`);
      return;
    }

    const npmScript = this.scriptQueue.shift();
    const npmSuccess = this.successQueue.shift();    
    const npmFailure = this.failureQueue.shift();
    angularProject.ngBuildProcess.processInfoType = 'npm Script: ';
    angularProject.ngBuildProcess.processInfoMessage = npmScript;
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
        angularProject.ngBuildProcess.succeeded = true;

        angularProject.ngBuildProcess.statusMessage = '\r--- ' + angularProject.ngBuildProcess.processInfoType + angularProject.npmScript +
          '\r\r' + buildResponse.statusMessage;
        success('SUCCESS!');
        // }
      } else {
        angularProject.ngBuildProcess.succeeded = false;
        angularProject.ngBuildProcess.processInfoType = 'npm Script:';
        angularProject.ngBuildProcess.processInfoMessage = npmScript;
        angularProject.ngBuildProcess.statusMessage = '\r--- ' + angularProject.ngBuildProcess.processInfoType + angularProject.npmScript +
          '\r\r' + buildResponse.statusMessage;
          const errorMessage = `Error: ${angularProject.ngEtestProcess.processInfoType} ${npmScript} failed!`
          error(errorMessage);
      }

    }, () => {
      angularProject.ngBuildProcess.succeeded = false;
      angularProject.ngBuildProcess.processInfoType = 'npm Script:';
      angularProject.ngBuildProcess.processInfoMessage = npmScript;
      error('Unhandled Exception: from Local NgServer!');
    });
  }
}
