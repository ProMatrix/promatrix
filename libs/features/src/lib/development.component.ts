import { Component, Inject, OnInit, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventLog } from '@promatrix/services';
import { DotnetService } from '@promatrix/services';
import { FirebaseService } from '@promatrix/services';
import { AppConfigService } from '@promatrix/services';
import { NotificationHelpDialogComponent } from './notification/notification.component';
@Component({
  templateUrl: './development.component.html',
  providers: [EventLog]
})
export class DevelopmentComponent implements OnInit {
  public isViewVisible = false;
  public selectedIndex = 0;
  service: DotnetService;
  constructor(private injector: Injector, readonly el: EventLog, readonly ac: AppConfigService, private readonly dialog: MatDialog) {
    if (ac.project === 'dotnet') {
      this.service = this.injector.get(DotnetService) as DotnetService;
  } else {
      this.service = this.injector.get(FirebaseService) as unknown as DotnetService;
  }
  }

  public ngOnInit() {
    this.ac.waitUntilInitialized(() => {
      this.isViewVisible = true;
    });
  }

  public onChangeTab(selectedIndex: number) {
    if (selectedIndex === 1) {
      this.getLogEntries();
    }
  }

  // State Management
  onClickSave() {
    this.service.saveActionsQueue((successMessage) => {
      this.ac.toastrInfo(successMessage);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    });
  }

  onClickLoad() {
    this.service.loadActionsQueue((textMessage: string) => {
      this.ac.toastrInfo(textMessage, -1);
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    }, 'somefilename');
  }

  // Application Exceptions

  getLogEntries() {
    this.el.getLogEntries(() => {
      this.isViewVisible = true;
    }, (errorMessage: string) => {
      this.isViewVisible = true;
    });
  }

  getEventTypeColor(entryType: number): string {
    switch (entryType) {
      case 0: return 'yellow';
      case 1: return 'red';
      case 2: return 'orange';
      case 3: return 'yellow';
      case 4: return 'blue';
    }
    return 'orange';
  }

  getIconName(entryType: number): string {
    switch (entryType) {
      case 0: return 'missing';
      case 1: return 'error';
      case 2: return 'warning';
      case 3: return 'missing';
      case 4: return 'error_outline';
    }
    return 'orange';
  }

  getEventTypeText(entryType: number): string {
    switch (entryType) {
      case 0: return 'Missing';
      case 1: return 'Error';
      case 2: return 'Warning';
      case 3: return 'Missing';
      case 4: return 'Information';
    }
    return 'orange';
  }

  onClickThrowException() {
    this.el.throwException(() => {

    },
      (errorMessage) => {
        this.getLogEntries();
        this.ac.toastrError(errorMessage);
      });
  }

  onClickLogEntry() {
    this.el.logEntry(() => {
      this.getLogEntries();
    },
      (errorMessage) => {
        this.ac.toastrError(errorMessage);
      });
  }

  // Metrics
  public onClickClearResponseTime() {
    this.ac.clearResponseTime();
  }
}

@Component({
  templateUrl: './development.component.help.html',
})
export class DevelopmentHelpDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { debugOnly: boolean, title: string, subtitle: string, show: boolean, helpTemplate: NotificationHelpDialogComponent }) {
    // data contains values passed by the router
  }
}
