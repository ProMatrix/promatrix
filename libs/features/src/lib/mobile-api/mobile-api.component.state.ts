import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
import { ChangeTabIndex, ToggleSpellChecking, UpdateTextMessage, ClearTextMessage, ChangeMobileCarrier, UpdateMobileNumber, MobileApiInit } from '@promatrix/essentials';
import { NgAction } from '@promatrix/essentials';

export class $MobileApisStateModel { // used to detect changes
  selectedIndex = 0;
  spellCheckingEnabled = false;
  clearTextMessage = false;
  textMessage = '';
  mobileCarrier = '';
  mobileNumber = '';
}

export class MobileApisStateModel {
  selectedIndex = 0;
  spellCheckingEnabled = false;
  clearTextMessage = false;
  textMessage = '';
  mobileCarrier = '';
  mobileNumber = '';
  previousState = new $MobileApisStateModel();
}

@State<MobileApisStateModel>({
  name: 'mobileApis',
  defaults: new MobileApisStateModel()
})
@Injectable()
export class MobileApisState {
  ngAction: NgAction;

  @Action(ChangeTabIndex)
  action01({ patchState }: StateContext<MobileApisStateModel>, { name, title, payload, playback, delay }: ChangeTabIndex) {
    patchState({ selectedIndex: payload });
    this.ngAction.appendToQueue(new ChangeTabIndex(name, title, payload, playback, delay));
  }

  @Action(ToggleSpellChecking)
  action02({ patchState }: StateContext<MobileApisStateModel>, { name, title, payload, playback, delay }: ToggleSpellChecking) {
    patchState({ spellCheckingEnabled: payload });
    this.ngAction.appendToQueue(new ToggleSpellChecking(name, title, payload, playback, delay));
  }

  @Action(ClearTextMessage)
  action03({ patchState }: StateContext<MobileApisStateModel>, { name, title, payload, playback, delay }: ClearTextMessage) {
    patchState({ clearTextMessage: payload });
    this.ngAction.appendToQueue(new ClearTextMessage(name, title, payload, playback, delay));
  }

  @Action(UpdateTextMessage)
  action04({ patchState }: StateContext<MobileApisStateModel>, { name, title, payload, playback, delay }: UpdateTextMessage) {
    patchState({ textMessage: payload });
    this.ngAction.appendToQueue(new UpdateTextMessage(name, title, payload, playback, delay));
  }

  @Action(ChangeMobileCarrier)
  action05({ patchState }: StateContext<MobileApisStateModel>, { name, title, payload, playback, delay }: ChangeMobileCarrier) {
    patchState({ mobileCarrier: payload });
    this.ngAction.appendToQueue(new ChangeMobileCarrier(name, title, payload, playback, delay));
  }

  @Action(UpdateMobileNumber)
  action06({ patchState }: StateContext<MobileApisStateModel>, { name, title, payload, playback, delay }: UpdateMobileNumber) {
    patchState({ mobileNumber: payload });
    this.ngAction.appendToQueue(new UpdateMobileNumber(name, title, payload, playback, delay));
  }

  @Action(MobileApiInit)
  action07({ patchState }: StateContext<MobileApisStateModel>, { ngAction }: MobileApiInit) {
    patchState({ selectedIndex: 0 });
    patchState({ spellCheckingEnabled: false });
    patchState({ clearTextMessage: false });
    patchState({ textMessage: '' });
    patchState({ mobileCarrier: '' });
    patchState({ mobileNumber: null });
    patchState({ previousState: new $MobileApisStateModel() });
    this.ngAction = ngAction;
  }
}
