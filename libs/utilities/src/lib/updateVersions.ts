import { Versioning } from 'project-control';

export class UpdateVersions {
    readonly versioning = new Versioning();

    constructor() {
        this.versioning.ct.setAppSettingsPath(process.cwd());
        const newVersion = this.versioning.updateVersions();
        console.log(`Update Version Successful! The new version is: ${newVersion}`);
    }
}

new UpdateVersions();

