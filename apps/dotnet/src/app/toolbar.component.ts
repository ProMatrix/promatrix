import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from '@promatrix/services';
import { DnAuthService } from '@promatrix/services';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  templateUrl: './toolbar.component.logon.html',
  providers: []
})
export class ApplicationLogonDialogComponent {
  ac: AppConfigService;
  auth: DnAuthService;
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; subtitle: string; bytesTransfered: number; totalBytes: number; description: string },
    auth: DnAuthService, private dialogRef: MatDialogRef<ApplicationLogonDialogComponent>) {
    this.ac = AppConfigService.getInstance();
    this.auth = auth;
  }

  returnKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.signIn();
    }
  }

  signIn(): void {
    this.auth.signIn(() => {
      this.ac.toastrSuccess('Successful login!');
      this.dialogRef.close();
      location.reload();
    }, (errorMessage) => {
      this.ac.toastrWarning(errorMessage);
    });
  }
}

@Component({
  templateUrl: './toolbar.component.help.html',
})
export class ApplicationAboutDialogComponent {
  public ac: AppConfigService;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; subtitle: string; bytesTransfered: number; totalBytes: number; description: string }) {
    this.ac = AppConfigService.getInstance();
  }
}

@Component({
  selector: 'promatrix-app-toolbar',
  templateUrl: './toolbar.component.html',
})
export class ToolbarComponent implements OnInit {
  @Output() public toggleSidenav = new EventEmitter<void>();
  public ac: AppConfigService;

  constructor(
    public auth: DnAuthService,
    private readonly dialog: MatDialog,
    private readonly route: ActivatedRoute,
    private readonly router: Router) {
    this.ac = AppConfigService.getInstance();
  }

  ngOnInit(): void {

    this.ac.waitUntilInitialized(() => {

      window.addEventListener('offline', () => {
        this.ac.toastrWarning('The application just went offline!');
        this.ac.isOnline = false;
      }, false);

      window.addEventListener('online', () => {
        this.ac.toastrSuccess('The application is back online!');
        this.ac.isOnline = true;
      }, false);
    });
  }

  signOut(): void {
    this.auth.signOut();
  }

  onClickToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  openLogonDialog(): void {
    this.dialog.open(ApplicationLogonDialogComponent, { width: '450px' });
  }

  openAboutDialog(): void {
    this.dialog.open(ApplicationAboutDialogComponent, { width: '450px' });
  }

  getOnlineStatusIconName(): string {
    if (this.ac.isOnline) {
      return 'signal_wifi_4_bar';
    } else {
      return 'signal_wifi_offline';
    }
  }

  getOnlineStatusText(): string {
    if (this.ac.isOnline) {
      return 'ONLINE';
    } else {
      return 'OFFLINE';
    }
  }

  onClickHelp(): void {
    const data$ = this.ac.getRouteData();

    this.dialog.open(data$.helpTemplate, {
      width: '600px',
      data: data$,
      id: 'pro-help-dialog',
    });
  }
}
