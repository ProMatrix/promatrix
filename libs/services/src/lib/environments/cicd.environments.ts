export class CicdRemoteServer {
    production = true;
    environmentCwd = 'prod';
    environmentArt = 'prod';
    serverUrl = 'http://localhost:1999/index';
    // studio.app.service
    getLocalServerCwd = this.serverUrl + '/getLocalServerCwd';
    getConfig = this.serverUrl + '/getConfig';
    getVersion = this.serverUrl + '/getVersion';
    saveDeveloperSetttings = this.serverUrl + '/saveDeveloperSetttings';
    // studio.lint.service
    initLintProject = this.serverUrl + '/initLintProject';
    lintAngularProject = this.serverUrl + '/lintAngularProject';
    // studio.build.service
    initBuildProject = this.serverUrl + '/initBuildProject';
    buildAngularProject = this.serverUrl + '/buildAngularProject';
    // studio.utest.service
    initUtestProject = this.serverUrl + '/initUtestProject';
    uTestAngularProject = this.serverUrl + '/uTestAngularProject';
    // studio.etest.service
    snapshotPath = 'promatrix/apps/cicd/src/assets';
    eTestSnapshot = this.serverUrl + '/eTestSnapshotProject';
    // studio.atest.service
    getSnapshots = this.serverUrl + '/getSnapshots';
    // studio.publish.service
    ngProcessScript = this.serverUrl + '/ngProcessScript';
    ngExecuteCommand = this.serverUrl + '/ngExecuteCommand';    
    publishAngularProject = this.serverUrl + '/publishAngularProject';
    // studio.cicd.service
    initCiCdProject = this.serverUrl + '/initCiCdProject';
    ciCdAngularProject = this.serverUrl + '/eTestSnapshotProject';

    constructor(production: boolean) {
        if (!production) {
            this.production = false;
            this.environmentCwd = 'apps';
            this.environmentArt = 'dev';
            this.serverUrl = 'http://localhost:1999/index';
            this.getLocalServerCwd = this.serverUrl + '/getLocalServerCwd';
            this.getConfig = this.serverUrl + '/getConfig';
            this.getVersion = this.serverUrl + '/getVersion';
            this.saveDeveloperSetttings = this.serverUrl + '/saveDeveloperSetttings';
            // studio.lint.service
            this.initLintProject = this.serverUrl + '/initLintProject';
            this.lintAngularProject = this.serverUrl + '/lintAngularProject';
            // studio.build.service
            this.initBuildProject = this.serverUrl + '/initBuildProject';
            this.buildAngularProject = this.serverUrl + '/buildAngularProject';
            // studio.utest.service
            this.initUtestProject = this.serverUrl + '/initUtestProject';
            this.uTestAngularProject = this.serverUrl + '/uTestAngularProject';
            // studio.etest.service
            this.snapshotPath = 'promatrix/apps/cicd/src/assets';
            this.eTestSnapshot = this.serverUrl + '/eTestSnapshotProject';
            // studio.atest.service
            this.getSnapshots = this.serverUrl + '/getSnapshots';
            // studio.publish.service
            this.ngProcessScript = this.serverUrl + '/ngProcessScript';
            this.publishAngularProject = this.serverUrl + '/publishAngularProject';
            // studio.cicd.service
            this.initCiCdProject = this.serverUrl + '/initCiCdProject';
            this.ciCdAngularProject = this.serverUrl + '/eTestSnapshotProject';
        }
    }
  }