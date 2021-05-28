import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationHelpDialogComponent } from './notification/notification.component';

@Component({
  selector: 'promatrix-base-help-dialog',
  templateUrl: './base.help.dialog.html',
})
export class BaseHelpDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { debugOnly: boolean, title: string, subtitle: string, show: boolean, helpTemplate: NotificationHelpDialogComponent }) {
    // data contains values passed by the router
  }
}
