import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
import { RequestHttpDownload, ResponseHttpDownload, HttpDotnetInit } from '@promatrix/essentials';
import { DotnetService } from '@promatrix/services';
import { NgAction } from '@promatrix/essentials';

export class HttpDotnetStateModel {
  requestHttpDownload = false;
  blob: Blob;
}

@State<HttpDotnetStateModel>({
  name: 'httpDemo',
  defaults: new HttpDotnetStateModel()
})
@Injectable()
export class HttpDotnetState {
  ngAction: NgAction;

  constructor(
    private readonly dn: DotnetService) {
  }

  @Action(RequestHttpDownload)
  action01({ patchState }: StateContext<HttpDotnetStateModel>, { name, title, payload, playback, delay }: RequestHttpDownload) {
    patchState({ requestHttpDownload: payload });
    this.ngAction.appendToQueue(new RequestHttpDownload(name, title, payload, playback, delay));
    patchState({ requestHttpDownload: false });
  }

  @Action(ResponseHttpDownload)
  action02({ patchState }: StateContext<HttpDotnetStateModel>, { payload, samplePayload }: ResponseHttpDownload) {
  }

  @Action(HttpDotnetInit)
  action03({ }: StateContext<HttpDotnetInit>, { ngAction }: HttpDotnetInit) {
    this.ngAction = ngAction;
  }

}
