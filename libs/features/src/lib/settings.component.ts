import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Dependency } from 'ngx-modelling';
import { AppConfigService } from '@promatrix/services';
import { NotificationHelpDialogComponent } from './notification/notification.component';
@Component({
  // #region template
  templateUrl: './settings.component.html',
  // #endregion
})
export class SettingsComponent implements OnInit {
  public isViewVisible = true;
  private dependencies = Array<Dependency>();

  constructor(readonly ac: AppConfigService) {
  }

  ngOnInit(): void {
    this.ac.waitUntilInitialized(() => {
      this.isViewVisible = true;
    });
  }

  getAppTitle(): string {
    if (this.ac.project === 'dotnet') {
      return 'Angular.Net Studio: ';
    } else {
      return 'Angular Fire Studio: ';
    }
  }
}

@Component({
  templateUrl: './settings.component.help.html'
})
export class SettingsHelpDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { debugOnly: boolean, title: string, subtitle: string, show: boolean, helpTemplate: NotificationHelpDialogComponent }) {
    // data contains values passed by the router
  }
}
