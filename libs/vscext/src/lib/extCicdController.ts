import * as express from 'express';
import { Request, Response } from 'express';
// NOTE: use this import when dev and testing configure extension
import { TaskConfig, BuildConfig } from 'project-control';
// NOTE: use this import when dev and testing configure standalone
//import { CommandLine, TaskConfig, BuildConfig } from '../../../NgResources/project-control';
// NOTE: use this import when dev and testing configure extension
import { AngularProject, DeveloperSettings } from 'ngx-modelling';
// NOTE: use this import when dev and testing configure standalone
//import { BuildConfiguration, AngularProject, DeveloperSettings } from '../../../NgResources/ngx-modelling';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { extServerCwd, localServerCwd } from './extCicdServer';

import * as util from 'util';
import * as child_process from 'child_process';
import * as fs from 'fs-extra';
const exec = util.promisify(child_process.exec);
const router = express();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cors({ origin: true }));

let cwd = '';
let projectDebugging = '';
let developersSettingsPath = '\\developersSettings.json';

const ignoreErrors = ['checking storage.rules for compilation errors...', 'this could be any string that you want to ignore as an error'];
// const ignoreErrors = ['0 errors'];

setTimeout(() => {
    if (extServerCwd.length > 0) {
        cwd = extServerCwd.substr(0, extServerCwd.lastIndexOf('\\'));
        projectDebugging = cwd.substr(cwd.lastIndexOf('\\') + 1, 100);
        developersSettingsPath = cwd + developersSettingsPath;
    }

    if (localServerCwd.length > 0) {
        cwd = localServerCwd.substr(0, localServerCwd.lastIndexOf('\\'));
        projectDebugging = cwd.substr(cwd.lastIndexOf('\\') + 1, 100);
        developersSettingsPath = cwd + developersSettingsPath;
    }
}, 500);

let angularProjects: Array<AngularProject>;
function updateSnapshots(envCwd: string) {

    let assetsSnapshots = '';
    if (envCwd === 'apps') {
        assetsSnapshots = `apps/cicd/src/assets/snapshots/`;
    }
    if (envCwd === 'prod') {
        assetsSnapshots = `apps/cicd/assets/snapshots/`;
    }
    angularProjects.forEach((project) => {
        let snapshotPath = assetsSnapshots + project.name;
        if (project.uatTests[0].actions) {
            snapshotPath += '/' + project.uatTests[0].actions;
        }
        if (fs.existsSync(snapshotPath)) {
            const goldenSnapshotPath = snapshotPath + '/golden';
            const testingSnapshotPath = snapshotPath + '/testing';
            const deltaSnapshotPath = snapshotPath + '/delta';
            if (fs.existsSync(goldenSnapshotPath)) {
                project.uatTests[0].goldenSnapshots = new Array<string>();
                fs.readdirSync(goldenSnapshotPath).forEach((i) => {
                    project.uatTests[0].goldenSnapshots.push(i.substr(0, 1));
                });
            }

            if (fs.existsSync(testingSnapshotPath)) {
                project.uatTests[0].testingSnapshots = new Array<string>();
                fs.readdirSync(testingSnapshotPath).forEach((i) => {
                    project.uatTests[0].testingSnapshots.push(i.substr(0, 1));
                });
            }

            if (fs.existsSync(deltaSnapshotPath)) {
                project.uatTests[0].deltaSnapshots = new Array<string>();
                fs.readdirSync(deltaSnapshotPath).forEach((i) => {
                    project.uatTests[0].deltaSnapshots.push(i.substr(0, 1));
                });
            }
        }

    });
}

router.get('/getConfig/:envCwd', (req: Request, res: Response) => {
    const tc = new TaskConfig(false, projectDebugging, developersSettingsPath);
    angularProjects = tc.bc.visualProject.developerSettings.angularProjects;
    updateSnapshots(req.params.envCwd);
    res.json(tc.bc);
});

router.get('/getVersion', (req: Request, res: Response) => {
    const tc = new TaskConfig(false, projectDebugging, developersSettingsPath);
    res.json(tc.getBuildVersion());
});

router.get('/getSnapshots/:snapshots/project/:project', (req: Request, res: Response) => {
    const project = angularProjects.filter(angularProject => angularProject.name === req.params.project)[0] as AngularProject;
    if (req.params.snapshots === 'golden') {
        res.json(project.uatTests[0].goldenSnapshots);
    }
    if (req.params.snapshots === 'testing') {
        res.json(project.uatTests[0].testingSnapshots);
    }
    if (req.params.snapshots === 'delta') {
        res.json(project.uatTests[0].deltaSnapshots);
    }
});

class CLICommand {
    command: string;
    npmSuccess: string;
    npmFailure: string;
    statusMessage: string;
    passed: boolean;
}

let commandParts: string[];
let successParts: string[];
let failureParts: string[];

router.post('/ngExecuteCommand', async (req: Request, res: Response) => {
    let angularProject: AngularProject = new AngularProject();
    try {
        const tc = new TaskConfig(false, projectDebugging, developersSettingsPath);
        angularProject = req.body as AngularProject;

        const projectFolder = tc.bc.visualProject.developerSettings.appFolder + '\\apps\\' + angularProject.name;
        process.chdir(projectFolder);

        const command = getScriptCommand(angularProject);
        commandParts = command.split('&&');
        successParts = angularProject.npmSuccess.split(';');
        failureParts = angularProject.npmFailure.split(';');
        if (command) {
            executeScriptCommands((cliCommand: CLICommand) => {
                let payloadType = 'errored';
                if (cliCommand.passed) {
                    payloadType = 'completed'
                }
                return res.json({ payloadType, statusMessage: cliCommand.statusMessage });
            });
        }

    } catch (error) {
        // TODO:DD
        if (angularProject.npmScript.indexOf('serve:launch') !== -1) {
            return res.json({ payloadType: 'completed', statusMessage: 'Error overwritten' });
        }
        return res.json({ payloadType: 'errored', statusMessage: `Script Failed: ${error.cmd}` });
    }
});

function executeScriptCommands(completed: (cliCommand: CLICommand) => unknown) {
    const command = commandParts.shift();
    const npmSuccess = successParts.shift();
    const npmFailure = failureParts.shift();
    const cliCommand = { command, passed: true, npmSuccess, npmFailure, statusMessage: '' };
    executeScriptCommand(cliCommand, (cliCommand: CLICommand) => {
        if (commandParts.length > 0) {
            executeScriptCommands(completed);
        } else {
            completed(cliCommand);
        }
    });
}

function executeScriptCommand(cliCommand: CLICommand, completed: (cliCommand: CLICommand) => unknown) {
    cliCommand.command = cliCommand.command.trim();
    if (cliCommand.command.slice(0, 2) === 'cd') {
        const dir = cliCommand.command.substr(3);
        process.chdir(dir);
        completed(cliCommand);
        return;
    }

    let statusMessage = '';
    try {
        const child = child_process.exec(cliCommand.command);
        child.stdout.on('data', (data) => {
            statusMessage += data;
            console.log(data);
        });

        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (data) => {
            statusMessage += data;
            console.log(data);
        });

        child.on('close', (exitCode) => {
            // eslint-disable-next-line no-control-regex
            cliCommand.statusMessage = statusMessage.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
            cliCommand.passed = true;
            if (exitCode === 1) {
                cliCommand.passed = false;
            }

            if (statusMessage.indexOf(cliCommand.npmSuccess) === -1) {
                cliCommand.passed = false;
            }
            completed(cliCommand);
        });

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

function getScriptCommand(angularProject: AngularProject): string {
    const script = angularProject.npmScript;
    let environmentArt = '';
    if (angularProject.environmentArt && angularProject.environmentArt.length > 0) {
        // adding to the name of the script the art test environment (apps or prod)
        environmentArt = '-' + angularProject.environmentArt;
    }

    let environmentCwd = '';
    if (angularProject.environmentCwd && angularProject.environmentCwd.length > 0) {
        // adding to the list of command line arguments the environment (apps or prod)
        environmentCwd = ' ' + angularProject.environmentCwd;
    }

    let jsonString = fs.readFileSync('package.json').toString();
    if (jsonString.charCodeAt(0) === 0xFEFF) {
        jsonString = jsonString.substring(1, jsonString.length);
    }

    const scripts = JSON.parse(jsonString).scripts;
    if (scripts) {
        const command = scripts[`${script}${environmentArt}`];
        if (command) {
            return `${command}${environmentCwd}`;
        } else {
            return null;
        }
    }
}

router.post('/ngProcessScript', async (req: Request, res: Response) => {
    let angularProject: AngularProject = new AngularProject();
    try {
        const tc = new TaskConfig(false, projectDebugging, developersSettingsPath);
        angularProject = req.body as AngularProject;

        let environmentArt = '';
        if (angularProject.environmentArt && angularProject.environmentArt.length > 0) {
            // adding to the name of the script the art test environment (apps or prod)
            environmentArt = ':' + angularProject.environmentArt;
        }

        let environmentCwd = '';
        if (angularProject.environmentCwd && angularProject.environmentCwd.length > 0) {
            // adding to the list of command line arguments the environment (apps or prod)
            environmentCwd = ' ' + angularProject.environmentCwd;
        }
        const projectFolder = tc.bc.visualProject.developerSettings.appFolder + '\\apps\\' + angularProject.name;
        process.chdir(projectFolder);
        let { stdout } = await exec(`npm run ${angularProject.npmScript}${environmentCwd}${environmentArt}`);
        // eslint-disable-next-line no-control-regex
        stdout = stdout.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
        ignoreErrors.forEach(ignore => {
            stdout = stdout.replace(ignore, '');
        });
        if (stdout.toLowerCase().indexOf('error') !== -1) {
            return res.json({ payloadType: 'errored', statusMessage: stdout });
        }
        return res.json({ payloadType: 'completed', statusMessage: stdout });
    } catch (error) {
        if (angularProject.npmScript.indexOf('serve:launch') !== -1) {
            return res.json({ payloadType: 'completed', statusMessage: 'Error overwritten' });
        }
        return res.json({ payloadType: 'errored', statusMessage: `Script Failed: ${error.cmd}` });
    }
});

router.post('/saveDeveloperSetttings', (req: Request, res: Response) => {
    const ds = req.body as DeveloperSettings;
    const bc = new BuildConfig(false, projectDebugging, developersSettingsPath);
    bc.saveDeveloperSettings(ds);
    res.end();
});

router.get('/getLocalServerCwd', function (req: Request, res: Response) {
    res.status(200).json({ message: cwd });
});
export const index = router;