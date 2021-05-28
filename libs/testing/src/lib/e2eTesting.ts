import * as child_process from 'child_process';
import * as ncli from 'node-command-line';
import * as fs from 'fs-extra';
import * as killport from 'kill-port';

export class E2eTesting {
  readonly firebasePath = 'functions/lib/src';
  readonly dotnetPath = 'dotnetcore';
  promatrixPath: string;
  project: string;
  port: number;
  dist: string;
  envCwd: string;
  consoleLog = '';
  constructor() {
    if (process.argv.length === 5) {
      this.project = process.argv[2];
      this.port = parseInt(process.argv[3]);
      this.envCwd = process.argv[4];
      this.dist = `dist/apps/${this.project}`;
      this.startBackendServer();
    } else {
      throw new Error('Error: cli argument list is wrong!');
    }
  }
  startBackendServer() {
    this.promatrixPath = process.cwd();
    if (this.project === 'dotnet') {
      this.startDotnetServer();
    }

    if (this.project === 'desktop' || this.project === 'phone') {
      this.startFirebaseServer();
    }
    if (this.project === 'cicd') {
      // don't need to start the ExtCicdServer
    }
    process.chdir(this.promatrixPath);
    if (!fs.existsSync(this.dist)) {
      throw new Error(`Error: ${this.dist} doesn't exist!`);
    }
    process.chdir(this.dist);
    killport(this.port, 'tcp');
    setTimeout(async () => {
      // continues running
      ncli.run(`node ../../../node_modules/http-server/bin/http-server -p ${this.port} -c-1`);
      process.chdir(this.promatrixPath);
      setTimeout(async () => {
        const command = `ng run ${this.project}-e2e:e2e --skipServe --headless`;

        this.execute((code: number,) => {
          process.exit(code);
        }, command);
      }, 5000);
    }, 5000);
  }

  startDotnetServer() {
    // serving on port: 2010
    process.chdir(this.dotnetPath);
    // continues running
    ncli.run(`dotnet run`);
  }

  startFirebaseServer() {
    process.chdir(this.firebasePath);
    // continues running
    ncli.run(`node ngFireRemoteStart`);
  }

  execute(completed: (code: number) => unknown, command: string) {
    try {
      const child = child_process.exec(command);
      child.stdout.on('data', function (data) {
        console.log(data);
        this.consoleLog += data;
      });

      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        console.log(data);
        this.consoleLog += data;
      });

      child.on('close', (exitCode) => {
        completed(exitCode);
      });

    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}

new E2eTesting();