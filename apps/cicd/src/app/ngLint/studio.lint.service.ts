import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { StudioAppService } from '../studio.app.service';
import { AngularProject, BuildResponse } from 'ngx-modelling';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment.dev';
import { CicdRemoteServer } from '@promatrix/services';

@Injectable({ providedIn: 'root' })
export class StudioLintService extends StudioAppService {
  lintCompleted = true;
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
      .angularProjects.filter((angularProject) => angularProject.lintEnabled === true);
    this.processProjectLoop(success, error);
  }

  processProjectLoop(success: (s: string) => void, error: (e: string) => void): void {
    this.nextProject((s: string) => {
      if (this.projectQueue.length === 0) {
        this.lintCompleted = true;
        success(s);
      } else {
        this.processProjectLoop(success, error);
      }
    }, (e: string) => {
      this.lintCompleted = true;
      error(e);
    });
  }

  private nextProject(success: (s: string) => void, error: (e: string) => void): void {
    if (this.projectQueue.length === 0) {
      this.lintCompleted = true;
      success(`BUT NO PROJECTS!`);
      return;
    }
    this.lintCompleted = false;
    const angularProject = this.projectQueue.shift();
    angularProject.ngLintProcess.processing = true;
    angularProject.ngLintProcess.completed = false;
    // cloning collection
    this.scriptQueue = angularProject.ngLintProcess.npmScripts.filter(() => true);
    this.successQueue = angularProject.ngLintProcess.npmSuccesses.filter(() => true);
    this.failureQueue = angularProject.ngLintProcess.npmFailures.filter(() => true);
    this.processScriptLoop(angularProject, success, error);
  }

  processScriptLoop(angularProject: AngularProject, success: (s: string) => void, error: (e: string) => void): void {
    this.nextScript(angularProject, (s: string) => {
      if (this.scriptQueue.length === 0) {
        angularProject.ngLintProcess.succeeded = true;
        angularProject.ngLintProcess.completed = true;
        angularProject.ngLintProcess.processing = false;
        angularProject.ngLintProcess.processInfoType = '';
        angularProject.ngLintProcess.processInfoMessage = '';
        this.lintCompleted = true;
        success(s);
      } else {
        this.processScriptLoop(angularProject, success, error);
      }
    }, (e: string) => {
      angularProject.ngLintProcess.succeeded = false;
      angularProject.ngLintProcess.completed = true;
      angularProject.ngLintProcess.processing = false;
      error(e);
    });

  }

  private nextScript(angularProject: AngularProject, success: (s: string) => void, error: (e: string) => void) {
    if (this.scriptQueue.length === 0) {
      this.lintCompleted = true;
      success(`BUT NO SCRIPTS!`);
      return;
    }

    const npmScript = this.scriptQueue.shift();
    const npmSuccess = this.successQueue.shift();
    const npmFailure = this.failureQueue.shift();
    angularProject.ngLintProcess.processInfoType = 'npm Script: ';
    angularProject.ngLintProcess.processInfoMessage = npmScript;
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
        angularProject.ngLintProcess.succeeded = true;

        angularProject.ngLintProcess.statusMessage = '\r--- ' + angularProject.ngLintProcess.processInfoType + angularProject.npmScript +
          '\r\r' + buildResponse.statusMessage;
        success('SUCCESS!');
        // }
      } else {
        angularProject.ngLintProcess.succeeded = false;
        angularProject.ngLintProcess.processInfoType = 'npm Script:';
        angularProject.ngLintProcess.processInfoMessage = npmScript;
        angularProject.ngLintProcess.statusMessage = '\r--- ' + angularProject.ngLintProcess.processInfoType + angularProject.npmScript +
          '\r\r' + buildResponse.statusMessage;
        const errorMessage = `Error: ${angularProject.ngEtestProcess.processInfoType} ${npmScript} failed!`
        error(errorMessage);
      }

    }, () => {
      angularProject.ngLintProcess.succeeded = false;
      angularProject.ngLintProcess.processInfoType = 'npm Script:';
      angularProject.ngLintProcess.processInfoMessage = npmScript;
      error('Unhandled Exception: from Local NgServer!');
    });
  }
}
