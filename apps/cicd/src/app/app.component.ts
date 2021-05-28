import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { StudioAppService } from './studio.app.service';
import { AppConfigService } from '@promatrix/services';
import { NgLintComponent } from '../app/ngLint/ngLint.component';
import { NgBuildComponent } from '../app/ngBuild/ngBuild.component';
import { NgUtestComponent } from '../app/ngUtest/ngUtest.component';
import { NgEtestComponent } from '../app/ngEtest/ngEtest.component';
import { NgAtestComponent } from '../app/ngAtest/ngAtest.component';
import { NgPublishComponent } from '../app/ngPublish/ngPublish.component';
import { NgCiCdComponent } from '../app/ngCiCd/ngCiCd.component';
import * as e from  '../environments/environment.dev';

@Component({
  selector: 'promatrix-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AppConfigService],
})
export class AppComponent implements AfterViewInit {
  @ViewChild(NgLintComponent) ngLint: NgLintComponent;
  @ViewChild(NgBuildComponent) ngBuild: NgBuildComponent;
  @ViewChild(NgUtestComponent) ngUtest: NgUtestComponent;
  @ViewChild(NgEtestComponent) ngEtest: NgEtestComponent;
  @ViewChild(NgAtestComponent) ngAtest: NgAtestComponent;
  @ViewChild(NgPublishComponent) ngPublish: NgPublishComponent;
  @ViewChild(NgCiCdComponent) ngCiCd: NgCiCdComponent;
  public readonly appTitle = 'Angular Fire Studio: DevOps';
  isViewVisible = false;
  selectedIndex = 6;
  constructor(readonly ac: AppConfigService, private readonly as: StudioAppService) {
    this.ac.getAppSettings('cicd', e.environment.production);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.getLocalServerCwd();
    }, 2000);
  }

  getLocalServerCwd(): void {
    this.as.getLocalServerCwd(
      (rootFolder: string) => {
        this.as.toastrInfo(`Angular Studio DevOps(root): ${rootFolder}`);
        this.getBuildConfig();
      },
      (errorMessage) => {
        this.isViewVisible = true;
        this.as.toastrError(errorMessage);
      }
    );
  }

  private getBuildConfig() {
    this.as.getBuildConfig(
      () => {
        this.clearPreviousMessages();
        this.ngLint.afterViewInit(this);
        this.ngBuild.afterViewInit(this);
        this.ngUtest.afterViewInit(this);
        this.ngEtest.afterViewInit(this);
        this.ngAtest.afterViewInit(this);
        this.ngPublish.afterViewInit(this);
        this.ngCiCd.afterViewInit(this);
        this.isViewVisible = true;
      },
      (errorMessage) => {
        this.isViewVisible = true;
        this.as.toastrError(errorMessage);
      }
    );
  }

  private clearPreviousMessages(): void {
    this.as.bc.visualProject.developerSettings.angularProjects.forEach(
      (project) => {
        project.environmentArt = null;
        project.environmentCwd = null;
        project.ngLintProcess.processInfoType = '';
        project.ngLintProcess.processInfoMessage = '';
        project.ngBuildProcess.processInfoType = '';
        project.ngBuildProcess.processInfoMessage = '';
        project.ngUtestProcess.processInfoType = '';
        project.ngUtestProcess.processInfoMessage = '';
        project.ngEtestProcess.processInfoType = '';
        project.ngEtestProcess.processInfoMessage = '';
        project.ngAtestProcess.processInfoType = '';
        project.ngAtestProcess.processInfoMessage = '';
        project.ngPublishProcess.processInfoType = '';
        project.ngPublishProcess.processInfoMessage = '';
      }
    );
  }

  startCiCd(): void {
    this.processLint();
  }

  processLint(): void {
    this.selectedIndex = 0;
    setTimeout(() => {
      if (this.ngCiCd.ds.lintCompleted) {
        this.processBuild();
      } else {
        this.ngLint.automate();
      }
    }, 1000);
  }

  processBuild(): void {
    this.ngCiCd.ds.lintCompleted = true;
    this.selectedIndex = 1;
    setTimeout(() => {
      if (this.ngCiCd.ds.buildCompleted) {
        this.processUtest();
      } else {
        this.ngBuild.automate();
      }
    }, 1000);
  }

  processUtest(): void {
    this.ngCiCd.ds.buildCompleted = true;
    this.selectedIndex = 2;
    setTimeout(() => {
      if (this.ngCiCd.ds.uTestsCompleted) {
        this.processEtest();
      } else {
        this.ngUtest.automate();
      }
    }, 1000);
  }

  processEtest(): void {
    this.ngCiCd.ds.uTestsCompleted = true;
    this.selectedIndex = 3;
    setTimeout(() => {
      if (this.ngCiCd.ds.eTestsCompleted) {
        this.processAtest();
      } else {
        this.ngEtest.automate();
      }
    }, 1000);
  }

  processAtest(): void {
    this.ngCiCd.ds.eTestsCompleted = true;
    this.selectedIndex = 4;
    setTimeout(() => {
      if (this.ngCiCd.ds.aTestsCompleted) {
        this.processPublish();
      } else {
        this.ngAtest.automate();
      }
    }, 1000);
  }

  processPublish(): void {
    this.ngCiCd.ds.aTestsCompleted = true;
    this.selectedIndex = 5;
    setTimeout(() => {
      if (this.ngCiCd.ds.publishCompleted) {
        this.processesCompleted();
      } else {
        this.ngPublish.automate();
      }
    }, 1000);
  }

  processesCompleted(): void {
    this.ngCiCd.ds.publishCompleted = true;
    this.selectedIndex = 6;
    setTimeout(() => {
      this.as.toastrSuccess(`CI/CD complete: Angular Fire Studio`);
    }, 3000);
  }

  updateBuildVersion(buildVersion: string): void {
    this.ac.appSettings.buildVersion = buildVersion;
  }

  onChangeTab(selectedIndex: number): void {
    if (selectedIndex === 2) {
      // TODO
    }
  }
}
