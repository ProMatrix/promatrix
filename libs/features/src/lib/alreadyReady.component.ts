import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TimingMetrics } from 'ngx-modelling';
// services
import { AppConfigService } from '@promatrix/services';

@Component({
  // #region template
  templateUrl: './alreadyReady.component.html',
  // #endregion
})
export class AlreadyReadyComponent implements OnInit {
  public isViewVisible = false;
  private timerId = null;
  private snapshotTaken = false;
  private tm = new TimingMetrics('Time of Initialization');

  constructor(private readonly ac: AppConfigService) {
  }

  ngOnInit(): void {
    this.tm.setStartMarker();
    this.ac.waitUntilInitialized(() => {
      this.isViewVisible = true;
      this.tm.setEndMarker();
    });
  }
}

@Component({
  templateUrl: './alreadyReady.component.help.html'
})
export class AlreadyReadyHelpDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title, subtitle, bytesTransfered, totalBytes, description }) {
    // data contains values passed by the router
  }
}
