import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
import { RequestHttpDownload, ResponseHttpDownload, HttpFirebaseInit } from '@promatrix/essentials';
import { FirebaseService } from '@promatrix/services';
import { NgAction } from '@promatrix/essentials';

export class HttpFirebaseStateModel {
  requestHttpDownload = false;
  blob: Blob;
}
@State<HttpFirebaseStateModel>({
  name: 'httpDemo',
  defaults: new HttpFirebaseStateModel()
})
@Injectable()
export class HttpFirebaseState {
  ngAction: NgAction;
  constructor(
    private readonly fb: FirebaseService) {
  }

  @Action(RequestHttpDownload)
  action01({ patchState }: StateContext<HttpFirebaseStateModel>, { name, title, payload, playback, delay }: RequestHttpDownload) {
    patchState({ requestHttpDownload: payload });
    this.ngAction.appendToQueue(new RequestHttpDownload(name, title, payload, playback, delay));
    patchState({ requestHttpDownload: false });
  }

  @Action(ResponseHttpDownload)
  action02({ patchState }: StateContext<HttpFirebaseStateModel>, { payload, samplePayload }: ResponseHttpDownload) {
  }

  @Action(HttpFirebaseInit)
  action03({ }: StateContext<HttpFirebaseInit>, { ngAction }: HttpFirebaseInit) {
    this.ngAction = ngAction;
  }

}
