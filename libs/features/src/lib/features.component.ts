import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConfigService } from '@promatrix/services';
import { Dependency } from 'ngx-modelling';
import { NotificationHelpDialogComponent } from './notification/notification.component';
@Component({
  // #region template

  templateUrl: './features.component.html',
  // #endregion
})
export class FeaturesComponent implements OnInit {
  public isViewVisible = true;
  private dependencies = Array<Dependency>();

  constructor(readonly ac: AppConfigService) {
  }

  public ngOnInit() {
    this.ac.waitUntilInitialized(() => {
      this.isViewVisible = true;
    });
  }
}

@Component({
  templateUrl: './features.component.help.html',
})
export class FeaturesHelpDialogComponent {
  public ac: AppConfigService;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { debugOnly: boolean, title: string, subtitle: string, show: boolean, helpTemplate: NotificationHelpDialogComponent }) {
    // data contains values passed by the router
    this.ac = AppConfigService.getInstance();
  }

  public getAngularVersion() {
    return this.ac.appSettings.apiVersions.angular;
  }
}
