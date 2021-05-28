import { Store } from '@ngxs/store';
import { ChangeTabIndex, ClearTextMessage, ToggleSpellChecking, UpdateTextMessage } from './mobile-api.component.actions';
import { NavigateTo, Snapshot, CloseShutter } from './side-nav.component.actions';
import { RequestHttpDownload } from './http.component.actions'
export class ActionFile {
  public fileName: string;
  public actionsQueue: string;
}

export class Action {
  public name: string;
  public title: string;
  public delay: number;
  public payload: any;
  public playback: boolean;
}

export class NgAction {
  private static instance: NgAction;
  private static store: Store;
  actionsQueue = new Array<Action>(); // fills as new actions are dispatched
  cameraShot = false;
  private currentIndex = -1;
  private currentSnapshot = 0;
  private recording = false;
  private dispatching = false;
  private lastTicks = 0;
  private continuation = false;

  constructor(private store: Store) {
    NgAction.store = store;
  }

  static getInstance(store: Store): NgAction {
    if (!NgAction.instance) {
      NgAction.instance = new NgAction(store);
    }
    return NgAction.instance;
  }

  startRecording() {
    this.recording = true;
    this.lastTicks = 0;
    this.currentSnapshot = 0;
  }

  stopRecording() {
    this.recording = false;
  }

  isRecording(): boolean {
    return this.recording;
  }

  isPlayingBack(): boolean {
    return this.dispatching;
  }

  isDispatching(): boolean {
    return this.dispatching;
  }

  appendToQueue(action: Action) {
    if (this.recording) {
      const currentTicks = new Date().getTime();
      if (this.lastTicks === 0) {
        action.delay = 1000;
      } else {
        action.delay = currentTicks - this.lastTicks;
      }
      this.lastTicks = currentTicks;

      this.actionsQueue.push(action);
      this.currentIndex = this.actionsQueue.length - 1;
    }
  }

  clearQueue() {
    this.actionsQueue.length = 0;
    this.currentIndex = -1;
  }

  getLatestIndex(): number {
    return this.currentIndex;
  }

  setLatestIndex(index: number) {
    this.currentIndex = index;
  }

  getCurrentSnapshot(): number {
    return this.currentSnapshot;
  }

  getTotalSnapshots(): number {
    const count = this.actionsQueue.filter(x => x.name === 'Snapshot').length;
    return count;
  }

  singleAction(index: number) {
    this.recording = false;
    this.dispatching = false;
    this.store.dispatch(this.actionsQueue[index]);
    this.currentIndex = index;
  }

  playback() {
    this.dispatching = true;
    this.recording = false;
    let playbackDelay: number;
    if (this.currentIndex === this.actionsQueue.length - 1) {
      this.continuation = false;
      playbackDelay = 2000;
      this.currentIndex = -1; // from the beginning
    } else {
      this.continuation = true;
      this.currentIndex++;
      playbackDelay = 500; // continuation
    }
    setTimeout(() => { this.playbackDelayed(); }, playbackDelay);
  }

  playbackDelayed() {
    this.store.dispatch({ type: '@@INIT' });
    this.store.dispatch({ type: '@@UPDATE_STATE' });
    let delay = 0;
    if (this.currentIndex === -1) {
      this.currentIndex = 0;
    }
    this.currentSnapshot = 0;

    for (let i = this.currentIndex; i < this.actionsQueue.length; i++) {
      const action = this.actionsQueue[i];
      if (action.playback) {
        if (this.continuation) {
          this.continuation = false;
        } else {
          delay += action.delay;
        }
        setTimeout(() => {
          this.currentIndex = i;
          if (action.name === 'Snapshot') {
            this.cameraShot = true;
            this.currentSnapshot += 1;
          } else {
            this.cameraShot = false;
          }
          this.store.dispatch(action);
          if (i === this.actionsQueue.length - 1) {
            setTimeout(() => {
              this.dispatching = false;
            }, 1000);
          }
        }, delay);
      }
    }
  }

  replaceActionsQueue(actionsQueue: Array<Action>) {
    const newActionsArray = new Array<Action>();
    actionsQueue.forEach((action) => {
      newActionsArray.push(this.createNewAction(action));
    });
    this.actionsQueue = newActionsArray;
    this.setLatestIndex(this.actionsQueue.length - 1);
  }

  createNewAction(action: Action): Action {
    switch (action.name) {
      case 'CloseShutter':
        return new CloseShutter(action.name, action.title, action.payload, action.playback, action.delay - 0);
      case 'Snapshot':
        return new Snapshot(action.name, action.title, action.payload, action.playback, action.delay - 0);
      case 'DownloadTxt':
        return new RequestHttpDownload(action.name, action.title, action.payload, action.playback, action.delay - 0);
      case 'NavigateTo':
        return new NavigateTo(action.name, action.title, action.payload, action.playback, action.delay - 0);
      case 'ChangeTab':
        return new ChangeTabIndex(action.name, action.title, action.payload, action.playback, action.delay - 0);
      case 'SpellChecking':
        return new ToggleSpellChecking(action.name, action.title, action.payload, action.playback, action.delay - 0);
      case 'UpdateMessage':
        return new UpdateTextMessage(action.name, action.title, action.payload, action.playback, action.delay - 0);
      case 'ClearMessage':
        return new ClearTextMessage(action.name, action.title, action.payload, action.playback, action.delay - 0);
      default:
        throw new Error('Action type not found!');
    }
  }
}
