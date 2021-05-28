import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, VERSION } from '@angular/core';
import { AnalyticsData, AppSettings, Performance, TextMessage, TimingMetrics } from 'ngx-modelling';
import { ApiService } from './api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Data } from '@angular/router';
import { apiVersions } from '@promatrix/essentials';
import { LocalService } from './local.service';
import { Store } from '@ngxs/store';
import * as _moment from 'moment';
const moment = _moment;
import { CicdRemoteServer } from './environments/cicd.environments';
import { FirebaseRemoteServer } from './environments/firebase.environments';
import { DotnetRemoteServer } from './environments/dotnet.environments';

@Injectable()
export class AppConfigService extends ApiService {
  private static instance: AppConfigService;
  public appSettings = new AppSettings();
  public settingsAvailable = false;
  public analyticsData = new AnalyticsData();
  public isPhoneSize = false;
  public isLandscapeView = false;
  public isInitialized = false;
  public isSpinnerAvailable = false;
  public isSpinnerVisible = false;
  public isOnline = true;
  public screenWidth = 0;
  public screenHeight = 0;
  public splashTime = 2000;
  public project = '';
  public production = false;
  public readonly smallWidthBreakpoint = 720;
  public readonly headerHeight = 200;
  public readonly sideNavWidth = 400;
  public readonly mapControlsHeight = 275;
  public readonly mapControlsWidth = 300;
  public readonly mediaQueryBreak = 1280;
  private tm = new TimingMetrics('getAppSettings');
  private readonly postClickSend = 'https://rest.clicksend.com/v3/sms/send';

  constructor(
    private ls: LocalService,
    private readonly route: ActivatedRoute,
    private snackBar: MatSnackBar,
    public store: Store,
    public http: HttpClient
  ) {
    super(http, store);
    if (!AppConfigService.instance) {
      AppConfigService.instance = this;
    }
  }

  static getInstance(): AppConfigService {
    return AppConfigService.instance;
  }

  getCiCdEnvironment(): CicdRemoteServer {
    return new CicdRemoteServer(this.production)
  }

  getFirebaseEnvironment(): FirebaseRemoteServer {
    return new FirebaseRemoteServer(this.production)
  }

  getDotnetEnvironment(): DotnetRemoteServer {
    return new DotnetRemoteServer(this.production)
  }

  getRouteData(): Data {
    let currentRoute = this.route.root;
    while (currentRoute.children[0] !== undefined) {
      currentRoute = currentRoute.children[0];
    }
    return currentRoute.snapshot.data;
  }

  getHelpFileHtml(helpFile: string, success: (x: string) => void): void {
    this.http.get(helpFile, { responseType: 'text' }).subscribe((html) => {
      success(html);
    });
  }

  showSpinner(show: boolean): void {
    if (show) {
      this.isSpinnerAvailable = true;
      setTimeout(() => {
        this.isSpinnerVisible = true;
      }, 0);
    } else {
      this.isSpinnerVisible = false;
      setTimeout(() => {
        this.isSpinnerAvailable = false;
      }, 1000);
    }
  }

  updateAnalytics(): void {
    let totalResponseTime = 0;
    this.analyticsData.performances = this.analyticsData.performances.map(
      (x) => {
        x.dateString = moment(x.date).format('YYYY-MM-DD');
        x.timeString = moment(x.date).format('HH:mm:ss');
        totalResponseTime += x.responseTime;
        return x;
      }
    );
    if (this.analyticsData.performances.length === 0) {
      this.analyticsData.averageResponseTime = 0;
    } else {
      this.analyticsData.averageResponseTime = Math.round(
        totalResponseTime / this.analyticsData.performances.length
      );
    }
    this.ls.setLocalStorage('analyticsData', this.analyticsData);
  }

  clearResponseTime(): void {
    this.analyticsData.performances.length = 0;
    this.analyticsData.averageResponseTime = 0;
    this.ls.setLocalStorage('analyticsData', this.analyticsData);
  }

  logResponseData(responseTime: number): void {
    if (this.analyticsData.performances.length > 9) {
      this.analyticsData.performances.pop();
    }
    const performance = new Performance();
    performance.date = new Date();
    performance.responseTime = responseTime;
    this.analyticsData.performances.unshift(performance);
    this.ls.setLocalStorage('analyticsData', this.analyticsData);
  }

  waitUntilInitialized(callback: () => void): void {
    const intervalTimer = setInterval(() => {
      if (this.isInitialized) {
        clearInterval(intervalTimer);
        callback();
      }
    }, 1000);
  }

  getAppSettings(project: string, production: boolean): void {
    this.project = project;
    this.production = production;
    try {
      this.tm.setStartMarker();
    } catch (e) {
      return;
    }

    this.analyticsData = this.ls.getLocalStorage('analyticsData');
    if (!this.analyticsData) {
      this.analyticsData = new AnalyticsData();
    }

    this.settingsAvailable = true;
    this.ls.setLocalStorage('appSettings', this.appSettings);
    try {
      this.tm.setEndMarker();
    } catch (e) {
      return;
    }
    this.updateAnalytics();
    this.appSettings.splashTime = this.splashTime;
    this.appSettings.buildVersion = apiVersions.buildVersion;
    this.appSettings.apiVersions.typeScript = apiVersions.typeScript;
    this.appSettings.apiVersions.nodeJs = apiVersions.nodeJs;
    this.appSettings.apiVersions.v8Engine = apiVersions.v8Engine;
    this.appSettings.apiVersions.rxJs = apiVersions.rxJs;
    this.appSettings.apiVersions.moment = apiVersions.moment;
    this.appSettings.apiVersions.angular = VERSION.full;
    this.appSettings.apiVersions.angularFire = apiVersions.angularFire;
    this.appSettings.apiVersions.firebase = apiVersions.firebase;
  }

  onResizeApp(): void {
    if (screen.availWidth <= 767) {
      this.isPhoneSize = true;
    } else {
      this.isPhoneSize = false;
    }
    this.onOrientationChange();
    this.screenWidth = this.getScreenWidth();
    this.screenHeight = this.getScreenHeight();
  }

  onOrientationChange(): void {
    if (screen.availWidth > screen.availHeight) {
      this.isLandscapeView = true;
    } else {
      this.isLandscapeView = false;
    }
  }

  getScreenWidth(): number {
    if (this.isPhoneSize) {
      return screen.availWidth;
    } else {
      return document.body.clientWidth;
    }
  }

  getScreenHeight(): number {
    if (this.isPhoneSize) {
      return screen.availHeight;
    } else {
      return document.body.clientHeight;
    }
  }

  toastrSuccess(message: string, duration?: number): void {
    if (!duration) {
      duration = 3000;
    }
    this.snackBar.open(message, 'X', {
      duration,
      panelClass: ['snackbar-success'],
    });
  }

  toastrError(message: string, duration?: number): void {
    if (!duration) {
      duration = -1;
    }

    this.snackBar.open(message, 'X', {
      duration,
      panelClass: ['snackbar-error'],
    });
    setTimeout(() => {
      const toastr = document.querySelector(
        '.mat-snack-bar-container'
      ) as HTMLElement;
      toastr.style.maxWidth = '100%';
    }, 0);
  }

  toastrWarning(message: string, duration?: number): void {
    if (!duration) {
      duration = 3000;
    }
    this.snackBar.open(message, 'X', {
      duration,
      panelClass: ['snackbar-warning'],
    });
  }

  toastrInfo(message: string, duration?: number): void {
    if (!duration) {
      duration = 3000;
    }
    this.snackBar.open(message, 'X', {
      duration,
      panelClass: ['snackbar-info'],
    });
  }

  // any common service that works for all environments, dotnet, desktop, development and production can go in the appConfig
  sendTextMessage(
    textMessage: TextMessage,
    success: () => void,
    error: (x: string) => void
  ): void {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + this.appSettings.smsPw,
    });
    this.post(
      {
        messages: [
          {
            from: this.appSettings.smsFrom,
            body: textMessage.message,
            to: textMessage.mobileNumber,
            source: 'sdk',
            schedule: 0,
          },
        ],
      },
      this.postClickSend,
      () => {
        success();
      },
      (errorMessage) => {
        error(errorMessage);
      },
      null,
      httpHeaders
    );
  }
}
