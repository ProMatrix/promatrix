import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConfigService } from '@promatrix/services';
import { NotificationHelpDialogComponent } from './notification/notification.component';
@Component({
  templateUrl: './splash.component.base64.html',
})
export class SplashComponent implements OnInit {

  public isViewVisible = true;
  public image0Visible = false;
  public image1Visible = false;
  public image2Visible = false;
  public image3Visible = false;
  public image4Visible = false;
  public image5Visible = false;
  private sequence = 0;
  timerId: ReturnType<typeof setInterval>;

  auth: unknown;

  constructor(private readonly ac: AppConfigService) {
    // get this from the app.component
    console.log('Need some work here!');
    this.auth = { loggedIn: true};
  }

  ngOnInit() {
    this.ac.waitUntilInitialized(() => {
      this.isViewVisible = true;
      this.switchImages();
    });
  }

  private switchImages() {
    this.timerId = setInterval(() => {
      if (this.sequence === 6) {
        this.sequence = 0;
      }
      this.image0Visible = false;
      this.image1Visible = false;
      this.image2Visible = false;
      this.image3Visible = false;
      this.image4Visible = false;
      this.image5Visible = false;
      switch (this.sequence) {
        case 0:
          this.image0Visible = true;
          break;
        case 1:
          this.image1Visible = true;
          break;
        case 2:
          this.image2Visible = true;
          break;
        case 3:
          this.image3Visible = true;
          break;
        case 4:
          this.image4Visible = true;
          break;
        case 5:
          this.image5Visible = true;
          break;
      }
      this.sequence++;
    }, 2000);
  }

}

@Component({
  templateUrl: './splash.component.help.html',
})
export class SplashHelpDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { debugOnly: boolean, title: string, subtitle: string, show: boolean, helpTemplate: NotificationHelpDialogComponent }) {
    // data contains values passed by the router
  }
}
