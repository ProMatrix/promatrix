import { Versioning } from 'project-control';
import * as fs from 'fs-extra';

export class UpdateTimeStamps {
  readonly versioning = new Versioning();

  constructor() {
    if (process.argv.length !== 3) {
      throw new Error('Error: cli argument list is wrong!');
    }
    // this.versioning.ct.setAppSettingsPath(process.cwd());
    this.updateTimeStamps(process.cwd(), process.argv[2], 'prod');    
    this.updateTimeStamps(process.cwd(), process.argv[2], 'dev');
  }

  updateTimeStamps(cwd: string, project: string, env) {
    const jestFile = `apps/${project}/src/app/${project}.regression.${env}.test.ts`;
    const timestamp = '// Timestamp: ';
    if (!fs.existsSync(jestFile)) {
      throw new Error(`Error: ${jestFile} does not exist!`);
    }
    let jestFileString = fs.readFileSync(jestFile).toString();
    const index = jestFileString.indexOf(timestamp);
    jestFileString = jestFileString.substr(0, index);
    const newTimeStamp = `${timestamp}${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}`;
    jestFileString += newTimeStamp;
    fs.writeFileSync(jestFile, jestFileString);
    console.log(`Update TimeStamp Successful for: ${jestFile} The new TimeStamps is: ${newTimeStamp}`);

  }
}

new UpdateTimeStamps();
