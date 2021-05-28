export class FirebaseRemoteServer {
    production = true;
    serverUrl = 'https://us-central1-ngx-studio-desktop.cloudfunctions.net/index';
    // App Settings
    postClickSend = 'https://rest.clicksend.com/v3/sms/send';
    // Http Demo
    getAllLocally = './assets/library.json';
    download = this.serverUrl + '/download';
    postEntity = location.origin + '/api/PostEntity';
    postCollection = location.origin + '/api/PostCollection';
    upload = location.origin + '/api/Upload';
    deleteEntity = location.origin + '/api/DeleteEntity';
    // Message Pump
    getServerTime = this.serverUrl + '/serverTime';
    channelRegistration = this.serverUrl + '/register';
    channelRefresh = this.serverUrl + '/refresh';
    // Redux
    samplePayload = location.origin + '/api/SamplePayload';
    // NgXs
    // saveActionsQueue = using Firebase API
    // loadActionsQueue = using Firebase API
    // logEntry
    throwException = location.origin + '/api/build/throwException';
    postLogEntry = location.origin + '/api/build/postLogEntry';
    getLogEntries = location.origin + '/api/build/getLogEntries';

    constructor(production: boolean) {
        if (!production) {
            this.production = false;
            this.serverUrl = 'http://localhost:2001/index';
            // Http Demo
            this.getAllLocally = './assets/library.json';
            this.download = this.serverUrl + '/download';
            this.postEntity = this.serverUrl + '/api/PostEntity';
            this.postCollection = this.serverUrl + '/api/PostCollection';
            this.upload = this.serverUrl + '/api/Upload';
            this.deleteEntity = this.serverUrl + '/api/DeleteEntity';
            // Message Pump
            this.getServerTime = this.serverUrl + '/serverTime';
            this.channelRegistration = this.serverUrl + '/register';
            this.channelRefresh = this.serverUrl + '/refresh';
            // Redux
            this.samplePayload = this.serverUrl + '/api/SamplePayload';
            // NgXs
            // saveActionsQueue = using Firebase API
            // loadActionsQueue = using Firebase API
            // logEntry
            this.throwException = this.serverUrl + '/api/build/throwException';
            this.postLogEntry = this.serverUrl + '/api/build/postLogEntry';
            this.getLogEntries = this.serverUrl + '/api/build/getLogEntries';
        }
    }
}