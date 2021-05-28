import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { AppServices, GoogleMapsComponent, SpeechToTextComponent, TextToSpeechComponent } from 'ngx-motion';
import { AppConfigService } from '@promatrix/services';
import { ChangeTabIndex, ClearTextMessage, MobileApiInit, ToggleSpellChecking, UpdateTextMessage } from '@promatrix/essentials';
import { MobileApisStateModel, MobileApisState } from './mobile-api.component.state';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { NotificationHelpDialogComponent } from '../notification/notification.component';

@Component({
  templateUrl: 'mobile-api.component.html',
})
export class MobileApisComponent implements OnInit, OnDestroy {
  @ViewChild(SpeechToTextComponent, { static: true }) public s2T: SpeechToTextComponent;
  @ViewChild(TextToSpeechComponent, { static: true }) public t2S: TextToSpeechComponent;
  @ViewChild(GoogleMapsComponent, { static: true }) public gm: GoogleMapsComponent;
  public selectedIndex = 0;
  public isViewVisible = false;
  public showSpeechToText = false;
  public showTextToSpeech = false;
  public showTextArea = true;
  private showToggleGroup = false;
  public mobileNumber: number;
  private readonly textAreaMinRowCount = 4;
  private readonly mobileNumberMaxLength = 10;
  public mobileApisState = new MobileApisStateModel();
  private successfulMessageSent = '';
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  @Select(MobileApisState) selectState: Observable<MobileApisState>;
  private subscription: Subscription;

  constructor(
    private store: Store,
    private readonly ac: AppConfigService,
    private readonly cd: ChangeDetectorRef,
    private readonly as: AppServices) {

    this.store.dispatch(new MobileApiInit(this.ac.ngAction));
    this.stateChanges();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private stateChanges() {
    this.subscription = this.selectState.subscribe(x => {
      const mobileApisState = x as undefined as MobileApisStateModel;
      mobileApisState.previousState = this.mobileApisState;
      this.mobileApisState = mobileApisState;

      if (mobileApisState.selectedIndex !== mobileApisState.previousState.selectedIndex) {
        this.updateTabIndex(mobileApisState.selectedIndex);
      }

      if (mobileApisState.spellCheckingEnabled !== mobileApisState.previousState.spellCheckingEnabled) {
        this.spellCheck();
      }

      if (mobileApisState.clearTextMessage !== mobileApisState.previousState.clearTextMessage) {
        setTimeout(() => {
          this.clearTextMessage();
        }, 500); // Adding motion
      }
    });
  }

  public ngOnInit() {
    this.ac.waitUntilInitialized(() => {
      this.isViewVisible = true;
      setTimeout(() => {
        this.showToggleGroup = true;
        this.initGoogleMaps();
      }, 0);
    });
  }

  onChangeTab(selectedIndex: number) {
    if (!this.ac.ngAction.isDispatching()) {
      this.store.dispatch(new ChangeTabIndex('ChangeTab', 'Click Tab', selectedIndex, true, -1));
    }
  }

  updateTabIndex(selectedIndex: number) {
    this.selectedIndex = selectedIndex;
  }

  // Speech To Text:
  onClickSpeechToText() {
    if (!this.s2T.featureIsAvailable) {
      this.unavailableFeature('Speech to Text');
      return;
    }
    this.s2T.owner = this;
    this.s2T.onRestartCallback = () => {
      // Don't do anything for now
    };

    this.s2T.onResultsCallback = (speech: string) => {
      this.store.dispatch(new UpdateTextMessage('UpdateMessage', 'Enter Message', this.mobileApisState.textMessage + speech, true, -1));
      this.cd.detectChanges();
    };
    this.s2T.isClosable = true;
    this.s2T.positionTop = -75;
    this.showSpeechToText = false;
    this.store.dispatch(new UpdateTextMessage('UpdateMessage', 'Enter Message', '', true, -1));
    setTimeout(() => {
      this.showSpeechToText = true;
    }, 0);
  }

  onChangeTextMessage(text: string) {
    this.store.dispatch(new UpdateTextMessage('UpdateMessage', 'Enter Message', text, true, -1));
  }

  unavailableFeature(feature: string) {
    this.ac.toastrInfo(feature + ' is unavailable with this browser...');
    setTimeout(() => {
      this.ac.toastrInfo('Upgrade to Google Chrome!');
    }, 5000);
  }

  onClickTextToSpeech() {
    if (!this.t2S.featureIsAvailable) {
      this.unavailableFeature('Text to Speech');
      return;
    }
    this.t2S.textToSpeak = this.mobileApisState.textMessage;
    this.t2S.isClosable = true;
    this.t2S.positionTop = -75;
    this.t2S.owner = this;
    this.showTextToSpeech = false;
    setTimeout(() => {
      this.showTextToSpeech = true;
    }, 0);
  }

  onClickClearTextMessage() {
    this.store.dispatch(new ClearTextMessage('ClearMessage', 'Clear Message', true, true, -1));

  }

  clearTextMessage() {
    this.mobileApisState.textMessage = '';
    this.mobileApisState.clearTextMessage = false;
  }

  onClickSpellCheck(spellCheck: boolean) {
    this.store.dispatch(new ToggleSpellChecking('SpellChecking', 'SpellChecking', spellCheck, true, -1));
  }

  spellCheck() {
    if (this.mobileApisState.spellCheckingEnabled) {
      const textArea = (document.querySelector('.textAreaNgModel') as HTMLFormElement);

      if (this.mobileApisState.spellCheckingEnabled) {
        this.as.spellChecker(textArea);
      } else {
        textArea.focus();
      }
    } else {
      setTimeout(() => {
        this.showTextArea = false;
        setTimeout(() => {
          this.showTextArea = true;
        });
      });
    }
  }

  getRowCount(): number {
    try {
      const count: number = (document.querySelector('.textAreaNgModel') as HTMLFormElement).value.split('\n').length;
      if (count > this.textAreaMinRowCount) {
        return count;
      } else {
        return this.textAreaMinRowCount;
      }
    } catch (e) {
      return this.textAreaMinRowCount;
    }
  }

  // Text Messaging:
  onKeyDown(event) {
    const mobileNumber = event.target.value;

    if (event.key === 'Backspace' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      return true;
    }

    if (mobileNumber.length === this.mobileNumberMaxLength) {
      return false;
    } else {
      return true;
    }
  }

  onKeyUp(mobileNumber: number) {
    this.mobileNumber = mobileNumber;
    if (mobileNumber.toString().length === this.mobileNumberMaxLength) {
      this.mobileApisState.mobileNumber = mobileNumber.toString();
      // this.store.dispatch(new UpdateMobileNumber(mobileNumber));
    }

  }

  shouldSendBeDisabled() {
    if (!this.mobileNumber) {
      return true;
    }
    if (this.mobileNumber.toString().length < this.mobileNumberMaxLength) {
      return true;
    }

    if (this.mobileApisState.textMessage.trim().length === 0) {
      return true;
    }

    if (this.successfulMessageSent === this.mobileApisState.textMessage) {
      return true;
    }
    return false;
  }

  onClickSend() {
    this.ac.showSpinner(true);
    this.ac.sendTextMessage({
      message: this.mobileApisState.textMessage,
      cellCarrierName: '',
      mobileNumber: parseInt(this.mobileApisState.mobileNumber, 10),
    }, () => {
      this.successfulMessageSent = this.mobileApisState.textMessage;
      this.ac.showSpinner(false);
      this.playAscending(0.01);
      this.ac.toastrSuccess(`Success: Your text message has been sent to: ${this.mobileApisState.mobileNumber}`);
    }, (errorMessage) => {
      this.ac.showSpinner(false);
      this.ac.toastrError(`Error: ${errorMessage}`);

    },
    );
  }

  playAscending(volume: number) {

    setTimeout(() => {
      this.play4Ths(volume);
      setTimeout(() => {
        this.play4Ths(volume / 2);
        setTimeout(() => {
          this.play4Ths(volume / 4);
          setTimeout(() => {
            this.play4Ths(volume / 8);
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  }

  play4Ths(volume: number) {
    setTimeout(() => {
      this.as.beep(1500, 523.25, volume, 'sine', null);
      setTimeout(() => {
        this.as.beep(1500, 698.46, volume, 'sine', null);
        setTimeout(() => {
          this.as.beep(1500, 932.33, volume, 'sine', null);
          setTimeout(() => {
            this.as.beep(1500, 1244.51, volume, 'sine', null);
          }, 250);
        }, 250);
      }, 250);
    }, 250);
  }

  // GoogleMaps:
  initGoogleMaps() {
    setTimeout(() => {
      this.gm.googleMapKey = this.ac.appSettings.googleMapKey;
      this.gm.initialize();
    });
  }

  shouldFindByAddressBeDisabled() {
    return this.gm.address.trim().length === 0 || this.gm.zipcode.toString().trim().length < 5;
  }

  calcGmTextWidth(): number {
    if (this.ac.isPhoneSize) {
      if (this.ac.isLandscapeView) {
        return this.ac.screenWidth / 3;
      } else {
        return this.ac.screenWidth - 70;
      }
    }
    return 270;
  }

  getGmTextWidth(): number {
    return this.calcGmTextWidth();
  }

  getMapWidth() {
    if (document.documentElement.clientWidth <= this.ac.smallWidthBreakpoint) {
      return document.documentElement.clientWidth;
    }
    if (document.documentElement.clientWidth <= this.ac.mediaQueryBreak) {
      return document.documentElement.clientWidth - (this.ac.sideNavWidth);
    }
    return document.documentElement.clientWidth - (this.ac.sideNavWidth + this.ac.mapControlsWidth);
  }

  getMapHeight() {
    if (document.documentElement.clientWidth <= this.ac.mediaQueryBreak) {
      return document.documentElement.clientHeight - (this.ac.headerHeight + this.ac.mapControlsHeight);
    }
    return document.documentElement.clientHeight - this.ac.headerHeight;
  }
}

@Component({
  templateUrl: './mobile-api.component.help.html',
})
export class MobileApisHelpDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { debugOnly: boolean, title: string, subtitle: string, show: boolean, helpTemplate: NotificationHelpDialogComponent }) {

   }
}
