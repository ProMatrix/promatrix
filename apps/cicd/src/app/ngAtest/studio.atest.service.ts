import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { StudioAppService } from '../studio.app.service';
import { AngularProject, BuildResponse } from 'ngx-modelling';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment.dev';
import { CicdRemoteServer } from '@promatrix/services';

@Injectable({
  providedIn: 'root',
})
export class StudioAtestService extends StudioAppService {
  aTestCompleted = true;
  displayedSnapshot = '';
  goldenSnapshotsIndex = 0;
  goldenSnapshots = Array<string>();
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
    this.projectQueue = this.bc.visualProject.developerSettings.angularProjects.filter(
      (angularProject) => angularProject.aTestEnabled === true
    );
    this.processProjectLoop(success, error);
  }

  processProjectLoop(success: (s: string) => void, error: (e: string) => void): void {
    this.nextProject(
      (s: string) => {
        if (this.projectQueue.length === 0) {
          this.aTestCompleted = true;
          success(s);
        } else {
          this.processProjectLoop(success, error);
        }
      },
      (e: string) => {
        this.aTestCompleted = true;
        error(e);
      }
    );
  }

  private nextProject(
    success: (s: string) => void,
    error: (e: string) => void
  ) {
    if (this.projectQueue.length === 0) {
      this.aTestCompleted = true;
      success(`BUT NO PROJECTS!`);
      return;
    }
    this.aTestCompleted = false;
    const angularProject = this.projectQueue.shift();
    angularProject.ngAtestProcess.processing = true;
    angularProject.ngAtestProcess.completed = false;
    // cloning collection
    this.scriptQueue = angularProject.ngAtestProcess.npmScripts.filter(() => true);
    this.successQueue = angularProject.ngAtestProcess.npmSuccesses.filter(() => true);
    this.failureQueue = angularProject.ngAtestProcess.npmFailures.filter(() => true);
    this.processScriptLoop(angularProject, success, error);
  }

  processScriptLoop(
    angularProject: AngularProject,
    success: (s: string) => void,
    error: (e: string) => void
  ): void {
    this.nextScript(
      angularProject,
      (s: string) => {
        if (this.scriptQueue.length === 0) {
          angularProject.ngAtestProcess.succeeded = true;
          angularProject.ngAtestProcess.completed = true;
          angularProject.ngAtestProcess.processing = false;
          angularProject.ngAtestProcess.processInfoType = '';
          angularProject.ngAtestProcess.processInfoMessage = '';
          this.aTestCompleted = true;
          success(s);
        } else {
          this.processScriptLoop(angularProject, success, error);
        }
      },
      (e: string) => {
        angularProject.ngAtestProcess.succeeded = false;
        angularProject.ngAtestProcess.completed = true;
        angularProject.ngAtestProcess.processing = false;
        error(e);
      }
    );
  }

  getSnapshots(
    snaphots: string,
    project: string,
    success: (s: Array<string>) => void,
    error: (e: string) => void
  ): void {
    this.get(
      `${this.appServer.getSnapshots}/${snaphots}/project/${project}`,
      (strings: Array<string>) => {
        success(strings);
      },
      () => {
        error('Error: Unknown HTTP error!');
      }
    );
  }

  private nextScript(
    angularProject: AngularProject,
    success: (s: string) => void,
    error: (e: string) => void
  ) {
    if (this.scriptQueue.length === 0) {
      this.aTestCompleted = true;
      success(`BUT NO SCRIPTS!`);
      return;
    }

    const npmScript = this.scriptQueue.shift();
    const npmSuccess = this.successQueue.shift();
    const npmFailure = this.failureQueue.shift();
    angularProject.ngAtestProcess.processInfoType = 'npm Script: ';
    angularProject.ngAtestProcess.processInfoMessage = npmScript;
    angularProject.npmScript = npmScript;
    angularProject.npmSuccess = npmSuccess;
    angularProject.npmFailure = npmFailure;

    if (npmScript.indexOf('pxArt') !== -1) {
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
          angularProject.ngAtestProcess.succeeded = true;

          angularProject.ngAtestProcess.statusMessage =
            '\r--- ' +
            angularProject.ngAtestProcess.processInfoType +
            angularProject.npmScript +
            '\r\r' +
            buildResponse.statusMessage;
          success('SUCCESS!');
          // }
        } else {
          angularProject.ngAtestProcess.succeeded = false;
          angularProject.ngAtestProcess.processInfoType = 'npm Script:';
          angularProject.ngAtestProcess.processInfoMessage = npmScript;
          angularProject.ngAtestProcess.statusMessage =
            '\r--- ' +
            angularProject.ngAtestProcess.processInfoType +
            angularProject.npmScript +
            '\r\r' +
            buildResponse.statusMessage;
            const errorMessage = `Error: ${angularProject.ngEtestProcess.processInfoType} ${npmScript} failed!`
            error(errorMessage);
        }
      },
      () => {
        angularProject.ngAtestProcess.succeeded = false;
        angularProject.ngAtestProcess.processInfoType = 'npm Script:';
        angularProject.ngAtestProcess.processInfoMessage = npmScript;
        error('Unhandled Exception: from Local NgServer!');
      }
    );
  }

  executeNpmScript(angularProject: AngularProject, script: string, success: (s: string) => void, error: (e: string) => void): void {
    angularProject.ngAtestProcess.processInfoType = 'npm Script: ';
    angularProject.ngAtestProcess.processInfoMessage = script;
    angularProject.npmScript = script;

    if (script.indexOf('pxArt') !== -1) {
      angularProject.environmentArt = this.appServer.environmentArt;
    } else {
      angularProject.environmentArt = null;
    }

    if (script.indexOf('envCwd') !== -1) {
      angularProject.environmentCwd = this.appServer.environmentCwd;
    } else {
      angularProject.environmentCwd = null;
    }
    // because runtimeScript01 has no success and failure strategy, we can force all runtimeScript01 to succeed
    const clonedAngularProject = Object.assign({}, angularProject);
    clonedAngularProject.npmSuccess = ';';

    this.post(clonedAngularProject, this.appServer.ngExecuteCommand, (buildResponse: BuildResponse) => {
        angularProject.ngAtestProcess.processInfoType = '';
        angularProject.ngAtestProcess.processInfoMessage = '';
        if (buildResponse.payloadType === 'completed') {
          angularProject.ngAtestProcess.succeeded = true;
          angularProject.ngAtestProcess.statusMessage +=
            '\r--- ' +
            angularProject.ngAtestProcess.processInfoType +
            angularProject.npmScript +
            '\r\r' +
            buildResponse.statusMessage;
          success('SUCCESS!');
        } else {
          angularProject.ngAtestProcess.succeeded = false;
          angularProject.ngAtestProcess.processInfoType = 'npm Script:';
          angularProject.ngAtestProcess.processInfoMessage = script;
          angularProject.ngAtestProcess.statusMessage +=
            '\r--- ' +
            angularProject.ngAtestProcess.processInfoType +
            angularProject.npmScript +
            '\r\r' +
            buildResponse.statusMessage;
          error(buildResponse.statusMessage);
        }
      },
      () => {
        angularProject.ngAtestProcess.succeeded = false;
        angularProject.ngAtestProcess.processInfoType = 'npm Script:';
        angularProject.ngAtestProcess.processInfoMessage = script;
        error('Unhandled Exception: from Local NgServer!');
      }
    );
  }
}
