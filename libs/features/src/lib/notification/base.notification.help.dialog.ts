import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationHelpDialogComponent } from './notification.component';
@Component({
  selector: 'promatrix-notification-base-help-dialog',
  templateUrl: './base.notification.help.dialog.html',
})
export class BaseNotificationHelpDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { debugOnly: boolean, title: string, subtitle: string, show: boolean, helpTemplate: NotificationHelpDialogComponent }) {
    // data contains values passed by the router
  }
}
