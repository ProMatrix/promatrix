import { Component } from '@angular/core';
import { StudioAppService } from '../studio.app.service';
import { StudioUtestService } from './studio.utest.service';
import { AngularProject } from 'ngx-modelling';
import { AppComponent } from '../app.component';

@Component({
  selector: 'promatrix-utest',
  templateUrl: './ngUtest.component.html'
})
export class NgUtestComponent {
  angularProjects = Array<AngularProject>();
  app: AppComponent;

  constructor(readonly as: StudioAppService, readonly ss: StudioUtestService) {
  }

  afterViewInit(app: AppComponent): void {
    this.app = app;
    this.angularProjects = this.as.bc.visualProject.developerSettings.angularProjects;
    // making an inherited base class look like a singleton
    this.ss.bc = this.as.bc;
    this.resetProcessStatus();
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
      this.as.saveDeveloperSetttings(() => {
        return;
      }, (errorMessage) => {
        this.as.toastrError(errorMessage);
      });
    });
  }

  automate(): void {
    this.process(() => {
      this.app.processEtest();
    }, (e: string) => {
      this.as.toastrError(e, 3000);
    });
  }

  onClickUtest(): void {
    this.resetProcessComplete();    
    this.process((s: string) => {
      this.as.toastrSuccess(`Successful utest: ${s}`);
    }, (e: string) => {
      this.as.toastrError(e, 3000);
    });
  }

  process(success: (s: string) => void, error: (e: string) => void): void {
    this.resetProcessStatus();
    this.ss.processAngularProjects((s: string) => {
      this.saveChanges();
      success(s);
    }, (e: string) => {
      this.saveChanges();
      error(e);
    });
  }

  onClickToggleStatus(project: AngularProject): void {
    project.ngUtestProcess.showStatus = !project.ngUtestProcess.showStatus;
  }
}
