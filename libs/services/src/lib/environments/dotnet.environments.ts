export class DotnetRemoteServer {
    production = true;
    serverUrl = location.origin;
    // Messaging
    messageHub = this.serverUrl + '/MessageHub';
    // Authenticate
    signIn = this.serverUrl + '/api/SignIn';
    getKeys = this.serverUrl + '/api/GetKeys';
    // Http Demo
    getAll = this.serverUrl + '/api/GetAll';
    getContent = this.serverUrl + '/api/GetContent';
    getAllLocally = './assets/library.json';
    download = this.serverUrl + '/api/download';
    postEntity = this.serverUrl + '/api/PostEntity';
    postCollection = this.serverUrl + '/api/PostCollection';
    upload = this.serverUrl + '/api/Upload';
    deleteEntity = this.serverUrl + '/api/DeleteEntity';
    // Message Pump
    registerChannel = this.serverUrl + '/api/notification/registerChannel';
    channelRefresh = this.serverUrl + '/api/notification/refresh';
    broadcast = this.serverUrl + '/api/notification/broadcast';
    // Redux
    samplePayload = this.serverUrl + '/api/SamplePayload';
    // NgXs
    saveActionsQueue = this.serverUrl + '/api/saveActionsQueue';
    loadActionsQueue = this.serverUrl + '/api/loadActionsQueue';
    // logEntry
    throwException = this.serverUrl + '/api/event/throwException';
    postLogEntry = this.serverUrl + '/api/event/postLogEntry';
    getLogEntries = this.serverUrl + '/api/event/getLogEntries';

    constructor(production: boolean) {
        if (!production) {
            this.production = false;
            this.serverUrl = 'http://localhost:2010';
            // Messaging
            this.messageHub = this.serverUrl + '/MessageHub';
            // Authenticate
            this.signIn = this.serverUrl + '/api/SignIn';
            this.getKeys = this.serverUrl + '/api/GetKeys';
            // Http Demo
            this.getAll = this.serverUrl + '/api/GetAll';
            this.getContent = this.serverUrl + '/api/GetContent';
            this.getAllLocally = './assets/library.json';
            this.download = this.serverUrl + '/api/download';
            this.postEntity = this.serverUrl + '/api/PostEntity';
            this.postCollection = this.serverUrl + '/api/PostCollection';
            this.upload = this.serverUrl + '/api/Upload';
            this.deleteEntity = this.serverUrl + '/api/DeleteEntity';
            // Message Pump
            this.registerChannel = this.serverUrl + '/api/notification/registerChannel';
            this.channelRefresh = this.serverUrl + '/api/notification/refresh';
            this.broadcast = this.serverUrl + '/api/notification/broadcast';
            // Redux
            this.samplePayload = this.serverUrl + '/api/SamplePayload';
            // NgXs
            this.saveActionsQueue = this.serverUrl + '/api/saveActionsQueue';
            this.loadActionsQueue = this.serverUrl + '/api/loadActionsQueue';
            // logEntry
            this.throwException = this.serverUrl + '/api/event/throwException';
            this.postLogEntry = this.serverUrl + '/api/event/postLogEntry';
            this.getLogEntries = this.serverUrl + '/api/event/getLogEntries';
        }
    }
}