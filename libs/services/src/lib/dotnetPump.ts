import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChannelMessage } from 'ngx-modelling';
import { AppConfigService } from './app-config.service';
import { ApiService } from './api.service';
import { Store } from '@ngxs/store';
import { LocalService } from './local.service';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { Channel } from './definitions';
import { DotnetRemoteServer } from './environments/dotnet.environments';

@Injectable({ providedIn: 'root' })
export class DotnetPump extends ApiService {
    registeredChannels = Array<Channel>();
    firebaseChannels = Array<Channel>();
    transmitMessageQueue = Array<ChannelMessage>();
    receiveMessageQueue = Array<ChannelMessage>();
    channelsToUnregister = Array<string>();
    channelRegistered = false;
    channelRegistrationInProcess = false;
    setToAutoRegister = false;
    textReceived = '';
    hubConnecton: HubConnection;
    timerId: ReturnType<typeof setTimeout>;
    serverTime: number;
    localTime: number;
    readonly ackTime = 1000;
    // significant discovery to use a stable copy, eliminates issues during subscribing to receiving channels
    registeredChannelsCopy = new Array<Channel>();
    readonly ackTimeout = 2500;
    messagesReceivedCallback: () => void;
    environment: DotnetRemoteServer;

    myChannel: Channel = {
        id: '0',
        lastAck: 0,
        name: '',
        message: '',
        messageTime: 0,
        subscriptions: Array<string>()
    };

    constructor(ac: AppConfigService, private ls: LocalService, store: Store, http: HttpClient) {
        super(http, store);
        this.environment = ac.getDotnetEnvironment();
        const cachedMessages = this.ls.getLocalStorage('transmitMessageQueue');
        if (cachedMessages) {
            this.transmitMessageQueue = cachedMessages;
        }
    }

    initSingalR() {
        this.hubConnecton = new HubConnectionBuilder().withUrl(this.environment.messageHub).build();
        this.hubConnecton.on('ReturnRegisteredChannels', (channels: Array<Channel>) => {
            this.registeredChannels = channels;
            const myChannel = this.registeredChannels.find((x) => x.name === this.myChannel.name);
            if (myChannel) {
                this.myChannel.id = myChannel.id;
            } else {
                this.channelRegistered = false;
                clearInterval(this.timerId);
            }
            this.updateRegisteredChannelsCopy();
        });

        this.hubConnecton.start()
            .then(() => {
                console.log('Success: now connected!');
            })
            .catch(e => {
                console.log(`Error: ${e.toString()}`);
            });
    }

    setToOffline() {
        this.myChannel.subscriptions.length = 0;
        this.registeredChannels.length = 0;
        if (this.channelRegistered) {
            this.setToAutoRegister = true;
        }
        this.channelRegistered = false;
    }

    startRefreshTimer(success: () => void, error: (x: string) => any) {
        this.timerId = setInterval(() => {
            if (this.channelRegistered) {
                this.refreshRegisteredChannel(() => {
                    success();
                }, errorMessage => {
                    error(errorMessage);
                });
            }

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

        this.hubConnecton.on('ReturnChannelMessage', (channel: Channel) => {
            const cm = new ChannelMessage();
            cm.sendersName = channel.name;
            cm.message = channel.message;
            const channelsSubscriptedTo = this.myChannel.subscriptions.filter(x => x === channel.name && channel.message.length > 0);

            if (channelsSubscriptedTo.length > 0) {
                this.receiveMessageQueue.push(cm);
                this.messagesReceivedCallback();
            }

            if (channel.name === this.myChannel.name) {
                this.myChannel.message = '';
            }
        });
        this.hubConnecton.invoke('ChannelRegistration', this.myChannel).catch(e => {
            error(e.message);
        });

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
        if (!channel) {
            this.channelRegistered = false;
            error('Error: Channel is not available!');
            finale();
            return;
        }
        // remove event handler
        this.hubConnecton.off('ReturnChannelUnRegistration');
        this.hubConnecton.off('ReturnChannelMessage');

        this.hubConnecton.on('ReturnChannelUnRegistration', (channels: Array<Channel>) => {
            this.hubConnecton.off('ReturnChannelUnRegistration');
            this.hubConnecton.invoke('GetRegisteredChannels').catch(e => {
                error(e.message);
            });
            success();
        });

        this.hubConnecton.invoke('ChannelUnRegistration', this.myChannel).catch(e => {
            error(e.message);
        });
        clearInterval(this.timerId);
        success();
        finale();
    }

    channelsStateChange(success: () => void, error: (x: string) => any, messagesReceivedCallback: () => any) {
        this.messagesReceivedCallback = messagesReceivedCallback;
        success();
    }

    refreshRegisteredChannel(success: () => void, error: (x: string) => any) {
        this.hubConnecton.invoke('RefreshRegisteredChannel', this.myChannel).catch(e => {
            error(e.message);
        });
    }

    updateRegisteredChannels(success: () => void, error: (x: string) => void) {
        this.hubConnecton.invoke('GetRegisteredChannels').catch(e => {
            error(e.message);
        });
        success();
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
        this.myChannel.message = message;
        this.refreshRegisteredChannel(success, error);
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

    // keep these for compatibility
    startAckTimer(success: () => void, error: (x: string) => any) {
    }

    getRegisteredChannels(success: () => void, error: (x: string) => void) {
    }

}
