import { NgAction } from './ngAction';
export class NavigateTo {
  static readonly type = '[side-nav] NavigateTo';
  constructor(public name: string, public title: string, public payload: string, public playback: boolean, public delay: number) {
  }
}

export class Snapshot {
  static readonly type = '[side-nav] Snapshot';
  constructor(public name: string, public title: string, public payload: number, public playback: boolean, public delay: number) {
  }
}
export class CloseShutter {
  static readonly type = '[side-nav] CloseShutter';
  constructor(public name: string, public title: string, public payload: number, public playback: boolean, public delay: number) {
  }
}
export class SideNavInit {
  static readonly type = '[side-nav] SideNavInit';
  constructor(public ngAction: NgAction) { }
}

