import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChannelMessage } from 'ngx-modelling';
import { AppConfigService } from './app-config.service';
import { ApiService } from './api.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { from } from 'rxjs';
import { Store } from '@ngxs/store';
import { LocalService } from './local.service';
import { Channel } from './definitions';
import { ServerTime } from './definitions';
import { FirebaseRemoteServer } from './environments/firebase.environments';

@Injectable({ providedIn: 'root' })
export class FirebasePump extends ApiService {
    registeredChannels = Array<Channel>();
    firebaseChannels = Array<Channel>();
    transmitMessageQueue = Array<ChannelMessage>();
    receiveMessageQueue = Array<ChannelMessage>();
    channelsToUnregister = Array<string>();
    channelRegistered = false;
    channelRegistrationInProcess = false;
    setToAutoRegister = false;
    textReceived = '';

    timerId: ReturnType<typeof setTimeout>;
    serverTime: number;
    localTime: number;
    readonly ackTime = 3000;
    // significant discovery to use a stable copy, eliminates issues during subscribing to receiving channels
    registeredChannelsCopy = new Array<Channel>();
    readonly ackTimeout = 60000;
    environment: FirebaseRemoteServer;

    myChannel: Channel = {
        id: '0',
        lastAck: 0,
        name: '',
        message: '',
        messageTime: 0,
        subscriptions: Array<string>()
    };

    constructor(ac: AppConfigService, private ls: LocalService, store: Store, http: HttpClient, private db: AngularFirestore, private storage: AngularFireStorage) {
        super(http, store);
        this.environment = ac.getFirebaseEnvironment();
        const cachedMessages = this.ls.getLocalStorage('transmitMessageQueue');
        if (cachedMessages) {
            this.transmitMessageQueue = cachedMessages;
        }
    }

    setToOffline() {
        this.myChannel.subscriptions.length = 0;
        this.registeredChannels.length = 0;
        if (this.channelRegistered) {
            this.setToAutoRegister = true;
        }
        this.channelRegistered = false;
    }

    getServerTime(success: (ms: number) => void, error: (x: string) => any) {
        if (this.serverTime) {
            // calculate actual server time, without going to the server
            const newTime = new Date().getTime();
            const actualServerTime = this.serverTime + (newTime - this.localTime);
            success(actualServerTime);
        } else {
            this.get(this.environment.getServerTime, (time: ServerTime) => {
                this.serverTime = time.milliseconds;
                this.localTime = new Date().getTime();
                success(time.milliseconds);
            }, (err) => {
                error(err);
            });
        }
    }

    startAckTimer(success: () => void, error: (x: string) => any) {
        // this timer will never stop
        setInterval(() => {
            this.checkAckTimeout(this.registeredChannels, () => {
            }, (errMessage) => {
                error(errMessage);
            });
        }, this.ackTime);
        success();
    }

    processIntervalTimer(success: () => void, error: (x: string) => any){
            this.getServerTime((ms) => {
                if (this.channelRegistered) {
                    if (this.myChannel.id === '0') {
                        this.myChannel.id = ms.toString();
                    }
                    this.myChannel.lastAck = ms;
                    this.onUpdateSubscriptions(() => {
                        success();
                    }, errorMessage => {
                        error(errorMessage);
                    });
                }
            }, errorMessage => {
                error(errorMessage);
            });
    }

    startRefreshTimer(success: () => void, error: (x: string) => any) {
        this.timerId = setInterval(() => {
            this.processIntervalTimer(success, error);
        }, this.ackTime);
        success();
    }

    register(success: () => void, error: (x: string) => any, finale: () => void) {
        const channelsWithSameName = this.registeredChannels.find((x) => {
            if (x.name === this.myChannel.name) {
                return x;
            }
        });

        if (channelsWithSameName) {
            error('This channel is already registered!');
            finale();
            return;
        }
        this.startRefreshTimer(() => {
            if (!this.channelRegistered) {
                this.channelRegistered = true;
                success();
                finale();
            }

        }, (errorMessage) => {
            error(errorMessage);
            finale();
        });
    }

    unregister(success: () => void, error: (x: string) => any, finale: () => void) {
        const channel = this.registeredChannels.find(x => {
            return x.name === this.myChannel.name;
        });
        this.myChannel.id = '0';
        if (!channel) {
            this.channelRegistered = false;
            error('Error: Channel is not available!');
            finale();
            return;
        }
        this.db.collection(`channels`).doc(channel.id).delete().then(() => {
            const index = this.registeredChannels.indexOf(channel);
            this.registeredChannels.splice(index, 1);
        }).catch((err) => {
            error(err.message);
            finale();
            return;
        });

        clearInterval(this.timerId);
        success();
        finale();
    }

    channelsStateChange(success: () => void, error: (x: string) => any, messagesReceivedCallback: () => void) {
        from(this.db.collection(`channels`).valueChanges()).subscribe(
            (channels: Array<Channel>) => {
                success();
                if (!this.channelRegistered) {
                    return;
                }
                this.registeredChannels = channels;
                let channelMessage: ChannelMessage;
                this.myChannel.subscriptions.forEach(chanSub => {
                    const channelSubscribedTo = channels.find(channel => {
                        if (channel.name === chanSub) {
                            return channel;
                        }
                    });
                    if (channelSubscribedTo) {
                        const existingChannel = this.firebaseChannels.find(channel => {
                            if (channel.name === channelSubscribedTo.name) {
                                return channel;
                            }
                        });
                        if (existingChannel) {
                            if (channelSubscribedTo.message.length > 0) {
                                if (channelSubscribedTo.messageTime !== existingChannel.messageTime) {
                                    // new message
                                    existingChannel.messageTime = channelSubscribedTo.messageTime;
                                    channelMessage = { sendersName: channelSubscribedTo.name, syncAction: '', type: 'ChannelMessage', message: channelSubscribedTo.message } as ChannelMessage;

                                    this.receiveMessageQueue.push(channelMessage);
                                    messagesReceivedCallback();
                                }
                            }
                        } else {
                            this.firebaseChannels.push(channelSubscribedTo);
                        }
                    }
                });
            },
            err => {
                error(err.message);
            }
        );
    }

    onUpdateSubscriptions(success: () => void, error: (x: string) => any) {
        const subscription = from(this.db.doc(`channels/${this.myChannel.id}`).set(this.myChannel)).subscribe(
            () => {
                subscription.unsubscribe();
                success();
            },
            err => {
                subscription.unsubscribe();
                error(err.message);
            }
        );
    }

    checkAckTimeout(channels: Array<Channel>, success: () => void, error: (x: string) => void) {
        this.getServerTime((ms) => {

            channels.forEach(channel => {
                if (channel.lastAck + this.ackTimeout < ms) {
                    // remove stale channels
                    this.db.collection(`channels`).doc(channel.id).delete().then(() => {
                        const index = channels.indexOf(channel);
                        channels.splice(index, 1);
                    }).catch((err) => {
                        error(err.message);
                    });
                }
            });
            success();
        }, errorMessage => {
            error(errorMessage);
        });
    }

    getRegisteredChannels(success: () => void, error: (x: string) => void) {
        const subscription = from(this.db.collection(`channels`).valueChanges()).subscribe(
            (channels: Array<Channel>) => {
                subscription.unsubscribe();
                this.registeredChannels = channels;
                success();
            },
            err => {
                subscription.unsubscribe();
                error(err.message);
            }
        );
    }

    updateRegisteredChannels(success: () => void, error: (x: string) => void) {
        from(this.db.collection(`channels`).valueChanges()).subscribe(
            (channels: Array<Channel>) => {
                this.registeredChannels = channels;
                this.updateRegisteredChannelsCopy();
                success();
            },
            err => {
                error(err.message);
            }
        );
    }

    updateRegisteredChannelsCopy() {
        let itentical = true;
        if (this.registeredChannelsCopy.length === this.registeredChannels.length) {
            for (const rc of this.registeredChannels) {
                const subName = this.registeredChannelsCopy.find((x) => x.name === rc.name);
                if (!subName) {
                    itentical = false;
                    break;
                }
            }
        } else {
            itentical = false;
        }

        if (!itentical) {
            this.registeredChannelsCopy = this.getOrderedRegisteredChannels();
        }
    }

    queueChannelMessage(success: () => void, error: (x: string) => any, offlineCondition: () => void, messagesReceivedCallback: () => void) {
        this.sendChannelMessage(success, error, offlineCondition, messagesReceivedCallback);
    }

    sendChannelMessage(success: () => void, error: (x: string) => any, offlineCondition: () => void, messagesReceivedCallback: () => void) {
        if (this.transmitMessageQueue.length === 0) {
            return;
        }

        if (!navigator.onLine) {
            this.ls.setLocalStorage('transmitMessageQueue', this.transmitMessageQueue);
            offlineCondition();
            return;
        }
        const message = this.transmitMessageQueue.shift();
        this.sendNextMessage(message.message, success, error, messagesReceivedCallback);
    }

    sendNextMessage(message: string, success: () => void, error: (x: string) => any, messagesReceivedCallback: () => void) {

        this.getServerTime((ms) => {
            this.myChannel.message = message;
            this.myChannel.messageTime = ms;
            this.onUpdateSubscriptions(success, error);
            return;
        }, (errorMessage) => {
            error(errorMessage);
            return;
        });
    }

    getChannelNamesForSubscriptions(): Array<string> {
        return this.registeredChannels.map((a) => a.name);
    }

    getOrderedRegisteredChannels(): Array<Channel> {
        return this.registeredChannels.sort((a, b) => {
            const textA = a.name.toUpperCase();
            const textB = b.name.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    }
}
