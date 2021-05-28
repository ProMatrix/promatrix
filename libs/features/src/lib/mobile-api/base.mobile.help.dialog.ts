import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationHelpDialogComponent } from '../notification/notification.component';
@Component({
  selector: 'promatrix-mobile-base-help-dialog',
  templateUrl: './base.mobile.help.dialog.html',
})
export class BaseMobileHelpDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { debugOnly: boolean, title: string, subtitle: string, show: boolean, helpTemplate: NotificationHelpDialogComponent }) {
    // data contains values passed by the router
  }
}
