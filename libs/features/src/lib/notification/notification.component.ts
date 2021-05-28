import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild, OnDestroy, Injector } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppServices, ModalDialogComponent, SpeechToTextComponent, TextToSpeechComponent } from 'ngx-motion';
import { AppConfigService } from '@promatrix/services';
import { FirebasePump } from '@promatrix/services';
import { DotnetPump } from '@promatrix/services';
import { Channel } from '@promatrix/services';
import { ChannelMessage } from 'ngx-modelling';

@Component({
    templateUrl: './notification.component.html',
})
export class NotificationComponent implements OnInit, OnDestroy {

    //#region Initialization
    @ViewChild(SpeechToTextComponent, { static: true }) s2T: SpeechToTextComponent;
    @ViewChild(TextToSpeechComponent, { static: true }) t2S: TextToSpeechComponent;
    @ViewChild(ModalDialogComponent, { static: true }) md: ModalDialogComponent;
    isViewVisible = false;
    textToSend = '';
    showTextArea = true;
    private speechRecognitionOn = false;
    private speechRecognitionPaused = false;
    private recognition: any;
    private newSentence: boolean;
    showSpeechToText = false;
    showTextToSpeech = false;
    spellCheck = false;
    private readonly textAreaMinRowCount = 3;
    private showModalDialog = false;
    // when developing the Firebase side
    // xcvr: MessagePump;
    xcvr: DotnetPump;
    constructor(private injector: Injector, readonly ac: AppConfigService, private readonly cd: ChangeDetectorRef, private readonly as: AppServices) {
        if (ac.project === 'dotnet') {
            this.xcvr = this.injector.get(DotnetPump) as DotnetPump;
        } else {
            this.xcvr = this.injector.get(FirebasePump) as unknown as DotnetPump;
        }
        window.ononline = () => {
            this.onlineCallback();
        };
        window.onoffline = () => {
            this.offlineCallback();
        };
    }

    onlineCallback() {
        if (this.xcvr.setToAutoRegister) {
            this.onClickRegister();
        }
    }

    offlineCallback() {
        this.xcvr.setToOffline();
    }

    private unregister() {
        if (this.xcvr.channelRegistered) {
            this.onClickUnregister();
        }
    }

    ngOnDestroy() {
        this.unregister();
    }

    ngOnInit() {
        addEventListener('beforeunload', () => {
            this.unregister();
        });

        if (this.ac.project === 'dotnet') {
            this.initDn();
        } else {
            this.initFb();
        }
    }

    initDn() {
        this.xcvr.initSingalR();
        this.ac.waitUntilInitialized(() => {
            this.xcvr.updateRegisteredChannels(() => {
                this.xcvr.channelsStateChange(() => {
                    this.isViewVisible = true;
                }, (errorMessage) => {
                    this.ac.toastrError(`Error: ${errorMessage}`);
                }, () => {
                    this.updateMessagesReceived();
                });
            }, (errorMessage) => {
                this.ac.toastrError(`Error: ${errorMessage}`);
            });
        });
    }

    initFb() {
        this.ac.waitUntilInitialized(() => {
            this.xcvr.updateRegisteredChannels(() => {
                this.xcvr.startAckTimer(() => {
                    this.xcvr.getRegisteredChannels(() => {
                        this.xcvr.channelsStateChange(() => {
                            this.isViewVisible = true;
                        }, (errorMessage) => {
                            this.ac.toastrError(`Error: ${errorMessage}`);
                        }, () => {
                            this.updateMessagesReceived();
                        });
                    }, (errorMessage) => {
                        this.ac.toastrError(`Error: ${errorMessage}`);
                    });

                }, (errorMessage) => {
                    this.ac.toastrError(`Error: ${errorMessage}`);
                });

            }, (errorMessage) => {
                this.ac.toastrError(`Error: ${errorMessage}`);
            });
        });
    }

    //#endregion

    //#region S2T & T2S:
    unavailableFeature(feature: string) {
        this.ac.toastrInfo(`${feature} ' is unavailable with this browser...`);
        setTimeout(() => {
            this.ac.toastrInfo('Upgrade to Google Chrome!');
        }, 5000);
    }

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
            if (!this.voiceActivation(speech)) {
                if (this.xcvr.channelRegistered) {
                    this.textToSend += speech + '\n';
                    this.cd.detectChanges();
                } else {
                    this.audioResponses(`can't compose message`);
                }
            }
        };
        this.s2T.isClosable = true;
        this.s2T.positionTop = -75;
        this.showSpeechToText = false;
        this.textToSend = '';
        setTimeout(() => {
            this.showSpeechToText = true;
        });
    }

    voiceActivation(command: string): boolean {
        switch (command.toLowerCase().trim()) {
            case 'computer register channel':
                if (this.shouldRegistrationBeDisabled()) {
                    this.audioResponses(`can't register channel`);
                } else {
                    this.onClickRegister();
                }
                return true;

            case 'computer unregister channel':
                if (this.shouldUnregistrationBeDisabled()) {
                    this.audioResponses(`can't unregister channel`);
                } else {
                    this.onClickUnregister();
                }
                return true;

            case 'computer check spelling':
                this.onClickSpellCheck(true);
                return true;

            case 'computer send message':
                if (this.shouldSendBeDisabled()) {
                    this.audioResponses(`can't send message`);
                } else {
                    this.onClickSendMessage();
                }
                return true;

            case 'computer clear text':
                this.onClickClearText();
                return true;

            default:
                break;
        }
        // partial matches
        if (command.toLowerCase().trim().indexOf('computer register channel') !== -1) {
            this.voiceRegisterChannel(command);
            return true;
        }

        if (command.toLowerCase().trim().indexOf('computer subscribe to channel') !== -1) {
            this.voiceSubscribeToChannel(command);
            return true;
        }
    }

    voiceRegisterChannel(command: string) {
        // protocol: 'computer register channel A'
        const commandParts = command.split(' ');
        if (commandParts.length < 4) {
            this.audioResponses('what do you want');
            return;
        }
        this.xcvr.myChannel.name = this.getChannelNameFromCommand(command, 3);
        this.onClickRegister();
    }

    getChannelNameFromCommand(command: string, index: number): string {
        const commandParts = command.split(' ');
        let channelName = '';
        for (let i = index; i < commandParts.length; i++) {
            channelName += commandParts[i] + ' ';
        }
        return channelName.trim().toUpperCase();
    }

    voiceSubscribeToChannel(command: string) {
        // protocol: 'computer subscribe to channel A'
        const commandParts = command.split(' ');
        if (commandParts.length < 5) {
            this.audioResponses('what do you want');
            return;
        }
        const channelName = this.getChannelNameFromCommand(command, 5);
        // is channel already subscribed to?
        const already = this.xcvr.myChannel.subscriptions.filter((i) => (i === channelName));
        if (already.length > 0) {
            this.audioResponses('channel already subscribed', channelName);
            return;
        }

        const available = this.xcvr.getChannelNamesForSubscriptions().filter((i) => (i === channelName));
        if (available.length !== 1) {
            this.audioResponses('channel not available', channelName);
            return;
        }
        this.xcvr.myChannel.subscriptions.push(channelName);
    }

    audioResponses(response: string, value?: string) {
        let audioResponse = '';
        switch (response) {
            case `can't register channel`:
                this.s2T.onClickPause();
                audioResponse = `Sorry! It's not possible to register the channel at this time!`;
                break;
            case `can't unregister channel`:
                this.s2T.onClickPause();
                audioResponse = `Sorry! It's not possible to unregister the channel at this time!`;
                break;
            case `can't compose message`:
                this.s2T.onClickPause();
                audioResponse = `Sorry! It's not possible to compose a message until after channel registration!`;
                break;
            case `what do you want`:
                this.s2T.onClickPause();
                audioResponse = `Sorry! I really don't know what you expect me to do. Please repeat!`;
                break;
            case `channel already subscribed`:
                this.s2T.onClickPause();
                audioResponse = 'Sorry! You are already subscribed to channel: ' + value;
                break;
            case `channel not available`:
                this.s2T.onClickPause();
                audioResponse = 'Sorry! Channel ' + value + ' is not available for supscription!';
                break;
            case `can't send message`:
                this.s2T.onClickPause();
                audioResponse = 'Sorry! To send a message, you must have a registered channel, and a message to send!';
                break;
            default:
                break;
        }
        this.textToSpeech(audioResponse);
        this.ac.toastrError(audioResponse);
    }

    onClickTextToSpeech() {
        this.textToSpeech(this.textToSend);
    }

    textToSpeech(speech: string) {
        if (!this.t2S.featureIsAvailable) {
            this.unavailableFeature('Text to Speech');
            return;
        }
        this.t2S.textToSpeak = speech;
        this.t2S.isClosable = true;
        this.t2S.positionTop = -75;
        this.t2S.owner = this;
        setTimeout(() => {
            this.t2S.setupT2S();
            this.t2S.Start();
        });
    }

    onClickClearText() {
        this.textToSend = '';
    }

    onClickSpellCheck(spellCheck: boolean) {
        this.spellCheck = spellCheck;
        if (this.spellCheck) {
            setTimeout(() => {
                const textArea = (document.querySelector('.text-to-send') as HTMLFormElement);
                if (this.spellCheck) {
                    this.as.spellChecker(textArea);
                } else {
                    textArea.focus();
                }
            });
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
        const count: number = (document.querySelector('.text-to-send') as HTMLFormElement).value.split('\n').length;
        if (count > this.textAreaMinRowCount) {
            return count;
        } else {
            return this.textAreaMinRowCount;
        }
    }
    // #endregion

    //#region Message Control
    updateMessagesReceived() {
        do {
            const receiveMessage = this.xcvr.receiveMessageQueue.shift();
            if (this.t2S.featureIsAvailable) {
                this.textToSpeech('channel ' + receiveMessage.sendersName + ' sends, ' + receiveMessage.message.toString());
            }
            this.xcvr.textReceived += receiveMessage.sendersName + '> ' + receiveMessage.message.toString() + '\n';
        } while (this.xcvr.receiveMessageQueue.length > 0);
    }

    onClickSendMessage() {
        // queue message before sending
        this.xcvr.transmitMessageQueue.push(this.getMessageObj(this.textToSend));
        if (this.s2T.featureIsAvailable) {
            this.s2T.onClickPause();
        }
        this.xcvr.queueChannelMessage(() => {
            this.ac.toastrSuccess('Message sent successfully!');
        }, (errorMessage) => {
            this.ac.toastrError(`Error: ${errorMessage}`);
        }, () => {
            this.ac.toastrInfo('Offline: Message is cached for sending when back online');
        }, () => {
            this.updateMessagesReceived();
        }
        );
    }

    getMessageObj(message: string): ChannelMessage {
        const channelMessage = new ChannelMessage();
        channelMessage.type = 'ChannelMessage';
        channelMessage.syncAction = 'dispatchMessage';
        channelMessage.sendersName = this.xcvr.myChannel.name;
        channelMessage.message = message;
        return channelMessage;
    }

    //#region Registration
    onClickRegister() {
        this.xcvr.channelRegistrationInProcess = true;
        this.xcvr.myChannel.name = this.xcvr.myChannel.name.toUpperCase();
        this.xcvr.register(() => {
            this.ac.toastrSuccess(`You successfully registered channel: ${this.xcvr.myChannel.name}`);
            this.xcvr.setToAutoRegister = false;

            if (this.xcvr.transmitMessageQueue.length > 0) {
                // TODO
                this.xcvr.sendChannelMessage(() => {
                }, (errorMessage) => {
                    this.ac.toastrError(`Error: ${errorMessage}`);
                }, () => {

                }, () => {
                    // new message
                });
            }

        }, (errorMessage) => {
            this.ac.toastrError(`Error: ${errorMessage}`);
        }, () => {
            setTimeout(() => { this.xcvr.channelRegistrationInProcess = false; }, 1500);
        });
    }

    onClickUnregister() {
        this.xcvr.channelRegistrationInProcess = true;
        this.xcvr.unregister(() => {
            this.xcvr.channelRegistered = false;
            // no message
        }, (errorMessage) => {
            this.ac.toastrError(`Error: ${errorMessage}`);
        }, () => {
            setTimeout(() => { this.xcvr.channelRegistrationInProcess = false; }, 1000);
        });
    }

    getReceivingSubscriptions(): Array<Channel> {
        if (this.xcvr.channelRegistered) {
            return this.xcvr.registeredChannelsCopy;
        } else {
            return new Array<Channel>();
        }
    }

    subscriptionSelection(channel: Channel) {
        const index = this.xcvr.myChannel.subscriptions.indexOf(channel.name);
        if (index === -1) {
            this.xcvr.myChannel.subscriptions.push(channel.name);
        } else {
            this.xcvr.myChannel.subscriptions.splice(index, 1);
        }
    }

    isChannelSelected(channel: Channel): boolean {
        const index = this.xcvr.myChannel.subscriptions.indexOf(channel.name);
        if (index === -1) {
            return false;
        } else {
            return true;
        }
    }
    //#region Button Control

    shouldRegistrationBeDisabled(): boolean {
        if (this.xcvr.myChannel.name.trim().length === 0 || this.xcvr.channelRegistered || this.xcvr.channelRegistrationInProcess || !navigator.onLine) {
            return true;
        }
        return false;
    }

    shouldUnregistrationBeDisabled(): boolean {
        if (!this.xcvr.channelRegistered || this.xcvr.channelRegistrationInProcess) {
            return true;
        }
        return false;
    }

    shouldSendBeDisabled(): boolean {
        if (!this.xcvr.channelRegistered) {
            return true;
        }
        if (this.textToSend.trim().length === 0) {
            return true;
        }
        if (!navigator.onLine) {
            return true;
        }
        return false;
    }
    //#endregion

    //#region Help System
    onClickHelp() {
        this.md.modalDialogTitle = 'Help on Notification';
        this.md.showOkButton = true;
        this.md.isClosable = true;
        this.md.desiredWidth = 750;
        this.md.desiredHeight = 425;
        this.showModalDialog = false;
        setTimeout(() => {
            this.showModalDialog = true;
        });
        this.md.dialogButtonCallback = (buttonClicked: string) => {
            if (buttonClicked === 'ok') {
                this.md.closeDialog();
            }
        };
    }
    //#endregion
}

@Component({
    templateUrl: './notification.component.help.html',
})
export class NotificationHelpDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) data: { debugOnly, title, subtitle, show, helpTemplate }) {
        // data contains values passed by the router
    }
}
