import { Component } from '@angular/core';
import { StudioAppService } from '../studio.app.service';
import { StudioAtestService } from './studio.atest.service';
import { AngularProject } from 'ngx-modelling';
import { AppComponent } from '../app.component';

@Component({
  selector: 'promatrix-atest',
  templateUrl: './ngAtest.component.html',
})
export class NgAtestComponent {
  angularProjects = Array<AngularProject>();
  app: AppComponent;

  constructor(readonly as: StudioAppService, readonly ss: StudioAtestService) { }

  afterViewInit(app: AppComponent): void {
    this.app = app;
    this.angularProjects = this.as.bc.visualProject.developerSettings.angularProjects;
    // making an inherited base class look like a singleton
    this.ss.bc = this.as.bc;
    this.updateSnapshotLocations();
    this.resetProcessStatus();
  }

  setSnapshotIndex(project: AngularProject, index: string) {
    project.uatTests[0].selectedSnapshotIndex = parseInt(index);
    this.updateSnapshotSelected(project);
  }

  onClickToggleStatus(project: AngularProject): void {
    this.updateSnapshotSelected(project);
    project.ngAtestProcess.showStatus = !project.ngAtestProcess.showStatus;
  }

  updateSnapshotSelected(project: AngularProject) {
    let snapshotPath = `assets/snapshots/${project.uatTests[0].name}`;
    if (project.uatTests[0].actions) {
      snapshotPath += '/' + project.uatTests[0].actions;
    }
    const snapshot = project.uatTests[0].goldenSnapshots[project.uatTests[0].selectedSnapshotIndex];
    if (project.ngAtestProcess.completed && !project.ngAtestProcess.succeeded) {
      project.uatTests[0].snapshotDisplayed = `${snapshotPath}/delta/${snapshot}.png`;
    } else {
      project.uatTests[0].snapshotDisplayed = `${snapshotPath}/golden/${snapshot}.png`;
    }
  }

  getSnapshotMembers(project: AngularProject): Array<string> {
    if (project.ngAtestProcess.completed && !project.ngAtestProcess.succeeded) {
      return project.uatTests[0].deltaSnapshots;
    } else {
      return project.uatTests[0].goldenSnapshots;
    }
  }

  getSnapshotId(index: string): number {
    return parseInt(index) + 1;
  }

  getIsSelected(project: AngularProject, index: string): string {
    if (parseInt(index) === project.uatTests[0].selectedSnapshotIndex) {
      return 'accent';
    }
    return 'primary';
  }

  updateSnapshotLocations() {
    this.angularProjects.forEach((project) => {
      this.ss.getSnapshots(
        'golden',
        project.name,
        (snapshots: Array<string>) => {
          project.uatTests[0].goldenSnapshots = snapshots;
        },
        (errorMessage) => {
          this.as.toastrError(errorMessage);
        }
      );

      this.ss.getSnapshots(
        'testing',
        project.name,
        (snapshots: Array<string>) => {
          project.uatTests[0].testingSnapshots = snapshots;
        },
        (errorMessage) => {
          this.as.toastrError(errorMessage);
        }
      );

      this.ss.getSnapshots(
        'delta',
        project.name,
        (snapshots: Array<string>) => {
          project.uatTests[0].deltaSnapshots = snapshots;
        },
        (errorMessage) => {
          this.as.toastrError(errorMessage);
        }
      );
    });
  }

  runScript(project: AngularProject, npmScript: string): void {
    project.npmScript = npmScript;
    this.ss.runScript(
      project,
      () => {
        return;
      },
      (errorMessage) => {
        this.as.toastrError(errorMessage);
      }
    );
  }

  resetProcessStatus(): void {
    this.angularProjects.forEach((project) => {
      project.ngAtestProcess.processing = false;
      project.ngAtestProcess.showStatus = false;
      project.ngAtestProcess.statusMessage = '';
    });
  }

  resetProcessComplete(): void {
    this.angularProjects.forEach((project) => {
      project.ngAtestProcess.completed = false;
    });
  }

  saveChanges(): void {
    setTimeout(() => {
      this.as.saveDeveloperSetttings(
        () => {
          return;
        },
        (errorMessage) => {
          this.as.toastrError(errorMessage);
        }
      );
    });
  }

  automate(): void {
    this.process(() => {
      this.app.processPublish();
    },
      (e: string) => {
        this.as.toastrError(e, 3000);
      }
    );
  }

  onClickAtest(): void {
    this.resetProcessComplete();
    this.process(
      (s: string) => {
        this.as.toastrSuccess(`Successful atest: ${s}`);
      },
      (e: string) => {
        this.as.toastrError(e, 3000);
      }
    );
  }

  process(success: (s: string) => void, error: (e: string) => void): void {
    this.resetProcessStatus();
    this.ss.processAngularProjects(
      (s: string) => {
        this.updateSnapshotLocations();
        this.saveChanges();
        success(s);
      },
      (e: string) => {
        this.updateSnapshotLocations();
        this.saveChanges();
        error(e);
      }
    );
  }

  onClickTakeSnapshot(project: AngularProject): void {
    this.ss.aTestCompleted = false;
    let snapshotScript = '';
    snapshotScript = project.ngAtestProcess.runtimeScript01;
    this.ss.executeNpmScript(
      project,
      snapshotScript,
      () => {
        this.as.toastrSuccess(
          `Successful snapshot-golden taken of project: ${project.name}`
        );
        this.ss.aTestCompleted = true;
      },
      (e: string) => {
        this.as.toastrError(e, -1);
        this.ss.aTestCompleted = true;
      }
    );
  }
}
