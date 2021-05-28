import * as puppeteer from 'puppeteer';
import * as ncli from 'node-command-line';
import * as fs from 'fs-extra';
import * as killport from 'kill-port';

export class Snapshot {
    readonly firebasePath = 'functions/lib/src';
    readonly dotnetPath = 'dotnetcore';
    project: string;
    port: number;
    url: string;
    filePath: string;
    dist: string;
    promatrixPath: string;
    snapshots: string;

    constructor(project: string, port: number, snapshots: string, envCwd: string) {
        try {
            this.project = project;
            this.snapshots = snapshots;
            this.port = port;
            this.url = `http://localhost:${this.port}?un=user@angularstudio.com&pw=passw00d!`;
            this.filePath = `${envCwd}/cicd/`;
            if (envCwd === 'apps') {
                this.filePath += `src/`;
            }
            this.filePath += `assets/snapshots/${this.project}`;
            this.dist = `dist/apps/${this.project}`;
            this.takeSnapshots();
        } catch (error) {
            console.error(`\n\n${error.message}\n`);
            process.exit(1);
        }
    }

    startDotnetServer() {
        // serving on port: 2010
        process.chdir(this.dotnetPath);
        ncli.run(`dotnet run`);
    }

    startFirebaseServer() {
        // npx kill-port gives me issues
        process.chdir(this.firebasePath);
        ncli.run(`node ngFireRemoteStart`);
    }

    async takeSnapshots() {
        this.promatrixPath = process.cwd();
        if (this.project === 'dotnet') {
            this.startDotnetServer();
        }

        if (this.project === 'desktop' || this.project === 'phone') {
            this.startFirebaseServer();
        }
        if (this.project === 'cicd') {
            // don't start the ExtCicdServer because it should have been started in the VSCode Extension
        }
        process.chdir(this.promatrixPath);

        if (!fs.existsSync(this.dist)) {
            throw new Error(`Error: ${this.dist} doesn't exist!`);
        }
        process.chdir(this.dist);

        killport(this.port, 'tcp');
        setTimeout(async () => {
            ncli.run(`node ../../../node_modules/http-server/bin/http-server -p ${this.port} -c-1`);
            await this.launchBrowser();
        }, 5000);
    }

    async launchBrowser() {
        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null
        });

        const pages = await browser.pages();
        const page = pages[0];
        await page.setViewport({ width: 1920, height: 1080 });

        process.chdir(this.promatrixPath);
        await page.goto(this.url);
        try {
            await page.waitForSelector('#camera_alt');
            await new Promise(res => setTimeout(res, 5000));
            if (!fs.existsSync(`${this.filePath}`)) {
                fs.mkdirSync(`${this.filePath}`);
            }
            if (!fs.existsSync(`${this.filePath}/${this.snapshots}`)) {
                fs.mkdirSync(`${this.filePath}/${this.snapshots}`);
            }
            const path = `${this.filePath}/${this.snapshots}/0.png`;
            await page.screenshot({ path });


        } catch (error) {
            console.error(error);
        }
        await browser.close();
        process.exit(0);
    }
}