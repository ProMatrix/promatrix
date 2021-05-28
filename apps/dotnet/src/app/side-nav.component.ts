import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Route } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import * as moment from 'moment';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppConfigService } from '@promatrix/services';
import { DotnetService } from '@promatrix/services';
import { DnAuthService } from '@promatrix/services';
import { LocalService } from '@promatrix/services';
import { NavigateTo, SideNavInit, Snapshot, CloseShutter } from '@promatrix/essentials';
import { SideNavStateModel, SideNavState } from './side-nav.component.state';

@Component({
  selector: 'promatrix-app-side-nav',
  templateUrl: './side-nav.component.html'
})
export class SideNavComponent implements OnInit, OnDestroy {
  ac: AppConfigService;
  auth: DnAuthService;
  selectedFeature: string;
  testing: string;
  private appHref: string;
  private theWeekOf: string;
  private subtitle = '';
  private sideNavState = new SideNavStateModel();
  private defaultState: unknown;
  private autoStartActionsRecording = false;
  private mediaMatcher: MediaQueryList = matchMedia(`(max-width: 720px)`);
  private pathname: string;
  @Select(SideNavState) selectState: Observable<SideNavState>;
  private subscription: Subscription;
  private actionTime: Date;
  private feature: Route;
  private un: string;
  private pw: string;
  private actions: string;
  timeoutId: ReturnType<typeof setTimeout>;

  constructor(
    auth: DnAuthService,
    ac: AppConfigService,
    private dn: DotnetService,
    private ls: LocalService,
    private store: Store,
    private readonly route: ActivatedRoute, readonly router: Router
  ) {
    this.pathname = location.pathname;
    this.ac = ac;
    this.auth = auth;
    const url = new URL(location.href);
    this.un = url.searchParams.get('un');
    this.pw = url.searchParams.get('pw');
    this.actions = url.searchParams.get('actions');
    this.testing = url.searchParams.get('testing');
  }

  async ngOnInit(): Promise<void> {
    this.getAppSettings();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getFeatureLabel(): string {
    if (this.ac.appSettings.debug || this.testing) {
      return 'Feature';
    }
    return '';
  }

  private getAppSettings() {
    this.ac.appSettings.debug = this.dn.isDebug();
    this.authenticate(() => {
      this.ac.appSettings.googleMapKey = this.auth.googleMapKey;
      this.ac.appSettings.smsFrom = this.auth.smsFrom;
      this.ac.appSettings.smsPw = this.auth.smsPw;
      this.ac.appSettings.aspNetCoreVersion = this.auth.aspNetCoreVersion;
      this.ac.isInitialized = true;
      this.initContinued();
    });
  }

  private authenticate(success: () => void) {
    if (this.un && this.pw) {
      this.auth.creds = { email: this.un, password: this.pw };
    }
    this.auth.signIn(() => {
      success();
    }, () => {
      this.ac.toastrInfo('Info: You will need to be logged in to do anything interesting!', -1);
    });
  }

  private initContinued() {
    this.initSideNav();
    this.checkForUpdates();

    this.feature = this.router.config.find(route => route.path === this.pathname.substr(1));
    if (this.testing  === 'true') {
      this.selectedFeature = 'splash';
    } else
    if (this.feature && this.feature.path.length > 0) {
      this.selectedFeature = this.feature.path;
    } else {
      this.navigateForward();
    }
    this.navigateTo(this.selectedFeature);
  }

  private initSideNav() {
    this.mediaMatcher.addEventListener('change', () => {
      this.mediaMatcher = matchMedia(`(max-width: ${this.ac.smallWidthBreakpoint}px)`);
    });

    this.store.dispatch(new SideNavInit(this.ac.ngAction));
    this.stateChanges();
    if (this.autoStartActionsRecording) {
      this.recordStateChanges();
    }

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
    ).subscribe(() => {
      let currentRoute = this.route.root;
      while (currentRoute.children[0] !== undefined) {
        currentRoute = currentRoute.children[0];
      }
      this.subtitle = currentRoute.snapshot.data.subtitle;
    });
    this.theWeekOf = moment().startOf('week').format('ddd MMM D YYYY');
    this.appHref = window.location.href;
  }

  getVsCurrentConfiguration(): string {
    if (location.hostname !== 'localhost') {
      return 'Production';
    }

    if (this.testing) {
      return 'Testing';
    }

    if (this.ac.appSettings.debug) {
      return 'Debug';
    } else {
      return 'Release';
    }
  }

  getCurrentSnaphot(): number {
    if (this.ac.ngAction.isRecording()){
      return this.ac.ngAction.getCurrentSnapshot();
    }
    return this.ac.ngAction.getCurrentSnapshot();
  }

  getTotalSnapshots(): number {
    if (this.ac.ngAction.isRecording()){
      return this.ac.ngAction.getTotalSnapshots();
    }
    return this.ac.ngAction.getTotalSnapshots();
  }

  getCameraShowing(): boolean {
    return this.ac.ngAction.isPlayingBack();
  }

  getCameraImage(): string {
    if (this.ac.ngAction.isRecording() || this.ac.ngAction.isPlayingBack()) {
      if (this.ac.ngAction.cameraShot) {
        this.playSnapshotSound();
        return 'camera';
      }
      return 'camera_alt';
    }
    return 'camera_empty';
  }

  playSnapshotSound() {
    if(this.timeoutId) {
      return;
    } else {
        const audio = document.createElement('audio');
        audio.src = 'assets/camera-shutter.mp3';
        audio.play();
        this.timeoutId = setTimeout(() => {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }, 1500);
    }
  }

  toggleRecord(): void  {
    if (this.ac.ngAction.isRecording()) {
      this.ac.ngAction.stopRecording();
    } else {
      this.actionTime = new Date();
      this.ac.ngAction.startRecording();
    }
  }

  recordingStatus(): string {
    if (this.ac.ngAction.isRecording()) {
      return 'Pause';
    } else {
      return 'Record';
    }
  }

  private recordStateChanges() {
    this.ac.ngAction.startRecording();
  }

  onClickPlayback(): void  {
    this.ac.ngAction.playback();
  }

  onClickSnapshot(): void  {
    const actionTime = new Date().getTime() - this.actionTime.getTime();
    this.ac.ngAction.cameraShot = true;
    this.store.dispatch(new Snapshot('Snapshot', 'Snapshot', actionTime, true, -1));
    setTimeout(() => {
      this.store.dispatch(new CloseShutter('CloseShutter', 'CloseShutter', 0, true, -1));
      this.ac.ngAction.cameraShot = false;
    }, 1000);
  }

  private stateChanges() {
    this.subscription = this.selectState.subscribe((x) => {
      const model = x as undefined as SideNavStateModel;
      // this is a snapshot
      if (model.actionTime !== 0) {
        return;
      }
      if (model.featureName !== (x as undefined as SideNavStateModel).previousState.featureName) {
        this.routerNavigate((x as undefined as SideNavStateModel).featureName);
      }
    });
  }

  private restartApp() {
    window.location.href = this.appHref;
  }

  private actionPlayback() {
    this.dn.loadActionsQueue((textMessage: string) => {
      textMessage += ' at: ' + moment().format('hh:mm:ss:SS');
      this.ac.toastrInfo(textMessage, 1000);
      this.onClickPlayback();
    }, (errorMessage: string) => {
      this.ac.toastrError(errorMessage);
    }, this.actions + '.json');
  }

  private navigateForward() {
    if (this.actions) {
      this.actionPlayback();
      return;
    }

    setTimeout(() => {
      const navigateTo = this.ls.getLocalStorage('navigateTo');
      if (navigateTo) {
        if (navigateTo.feature === 'development' && this.ac.appSettings.debug === false) {
          this.navigateTo('splash');
          return;
        }
        this.navigateTo(navigateTo.feature);
      } else {
        this.navigateTo('splash');
      }
    }, this.ac.appSettings.splashTime); // navigate away from splash view
  }

  showLoginFirstMessage(): void  {
    this.ac.toastrInfo(`Login first! Don't have an account? No worries... Just use the guest account!`, 5000);
  }

  animateTo(feature: Route): void  {
    if (!this.auth.loggedIn) {
      this.showLoginFirstMessage();
      return;
    }

    feature.data.show = false;
    setTimeout(() => {
      feature.data.show = true;
    }, 500);
    this.navigateTo(feature.path);
  }

  private navigateTo(featurePath: string) {
    const feature = this.router.config.find((obj) => obj.path === featurePath);
    if (feature === undefined) {
      throw new Error('splash config object not found!');
    }
    this.store.dispatch(new NavigateTo('NavigateTo', feature.data.title, featurePath, true, -1));
  }

  private routerNavigate(featurePath: string) {
    if (featurePath === 'restart') {
      this.ac.toastrWarning('Restarting the application now...');
      setTimeout(() => {
        this.restartApp();
      }, 1000);
      return;
    } else {
      this.ls.setLocalStorage('navigateTo', { feature: featurePath });
      this.selectedFeature = featurePath;
      this.router.navigate([featurePath]);
    }
  }

  isScreenSmall(): boolean {
    return this.mediaMatcher.matches;
  }

  private updateVersionAndRestart() {
    this.ls.setLocalStorage('buildVersion', { buildVersion: this.ac.appSettings.buildVersion });
    this.ac.toastrInfo('Updating to latest version: ' + this.ac.appSettings.buildVersion + ' Restarting the application...');
    setTimeout(() => {
      this.restartApp();
    }, 3000);
  }

  private checkForUpdates() {
    if (this.ac.appSettings.debug) {
      return;
    }

    const buildVersion = this.ls.getLocalStorage('buildVersion');
    if (!buildVersion) {
      this.updateVersionAndRestart();
      return;
    }

    if (buildVersion.buildVersion !== this.ac.appSettings.buildVersion) {
      this.updateVersionAndRestart();
      return;
    }

    if (navigator.onLine) {
      this.ac.isOnline = true;
      this.ac.toastrSuccess('This application is operating online as normal.');
    } else {
      this.ac.isOnline = false;
      this.ac.toastrWarning('This application is operating offline as normal.');
    }
  }
}
