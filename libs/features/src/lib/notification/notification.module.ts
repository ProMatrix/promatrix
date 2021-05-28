import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppAnimationModule, AppHelperModule, MaterialModule, MobileTechModule } from 'ngx-motion';
import { BaseNotificationHelpDialogComponent } from './base.notification.help.dialog';
import { NotificationComponent, NotificationHelpDialogComponent } from './notification.component';

@NgModule({
  declarations: [
    BaseNotificationHelpDialogComponent, NotificationComponent, NotificationHelpDialogComponent
  ],
  imports: [
    FormsModule,
    AppAnimationModule,
    MobileTechModule,
    MaterialModule,
    AppHelperModule.forRoot(),
    RouterModule.forChild([
      {
        path: '',
        component: NotificationComponent
      },
    ]),
  ],
})
export class NotificationModule { }
