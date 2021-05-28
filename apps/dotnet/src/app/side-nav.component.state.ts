import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
import { NavigateTo, SideNavInit, Snapshot, CloseShutter } from '@promatrix/essentials';
import { AppSettings } from 'ngx-modelling';
import { NgAction } from '@promatrix/essentials';

export class $SideNavStateModel { // used to detect changes
  requestAppSettings = false;
  responseAppSettings = new AppSettings();
  featureName = '';
}
@Injectable()
export class SideNavStateModel {
  requestAppSettings = false;
  responseAppSettings = new AppSettings();
  featureName = '';
  previousState = new $SideNavStateModel();
  actionTime = 0;
  ngAction: NgAction;
}

@State<SideNavStateModel>({
  name: 'sideNav',
  defaults: new SideNavStateModel()
})
@Injectable()
export class SideNavState {
  ngAction: NgAction;

  @Action(NavigateTo)
  action01({ patchState }: StateContext<SideNavStateModel>, { name, title, payload, playback, delay }: NavigateTo): void {
    patchState({ featureName: payload });
    this.ngAction.appendToQueue(new NavigateTo(name, title, payload, playback, delay));
  }

  @Action(SideNavInit)
  action02({ patchState }: StateContext<SideNavStateModel>, { ngAction }: SideNavInit): void {
    patchState({ ngAction });
    this.ngAction = ngAction;
  }

  @Action(Snapshot)
  action03({ patchState }: StateContext<SideNavStateModel>, { name, title, payload, playback, delay }: Snapshot): void {
    patchState({ actionTime: payload });
    this.ngAction.appendToQueue(new Snapshot(name, title, payload, playback, delay));
  }

  @Action(CloseShutter)
  action04({ patchState }: StateContext<SideNavStateModel>, {  name, title, payload, playback, delay }: CloseShutter): void {
    patchState({ actionTime: payload });
    this.ngAction.appendToQueue(new CloseShutter(name, title, payload, playback, delay));
  }
}
