import { Component } from '@angular/core';
import { StudioAppService } from '../studio.app.service';
import { StudioCiCdService } from './studio.ciCd.service';
import { AppComponent } from '../app.component';
import { DeveloperSettings } from 'ngx-modelling';

@Component({
  selector: 'promatrix-cicd',
  templateUrl: './ngCiCd.component.html'
})
export class NgCiCdComponent {
  app: AppComponent;
  ds: DeveloperSettings;
  initialized = false;

  constructor(readonly as: StudioAppService, readonly ss: StudioCiCdService) {
  }

  afterViewInit(app: AppComponent): void {
    this.app = app;
    // making an inherited base class look like a singleton
    this.ss.bc = this.as.bc;
    this.ds = this.as.bc.visualProject.developerSettings;
    this.initialized = true;
  }

  onClickContinue(): void {
    this.app.startCiCd();
  }

  onClickRestart(): void {
    this.ds.lintCompleted = false;
    this.ds.buildCompleted = false;
    this.ds.uTestsCompleted = false;
    this.ds.eTestsCompleted = false;
    this.ds.aTestsCompleted = false;
    this.ds.publishCompleted = false;
    this.app.startCiCd();
  }

  onClickCheckbox() {
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
}
