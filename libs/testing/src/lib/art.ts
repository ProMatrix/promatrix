import * as fs from 'fs-extra';
import * as pngjs from 'pngjs';
import * as pixelmatch from 'pixelmatch';
export class ART {
  goldenPath: string;
  testingPath: string;
  deltaPath: string;

  constructor(envCwd: string, project: string, actions?: string) {
    let filePath = `${envCwd}/cicd/`;
    
    if (actions) {
      actions = `/${actions}`;
    } else {
      actions = '';
    }
    if (envCwd === 'apps') {
        filePath += `src/`;
      }
    filePath += `assets/snapshots/${project}${actions}`;
    this.goldenPath = `${filePath}/golden`;
    this.testingPath = `${filePath}/testing`;
    this.deltaPath = `${filePath}/delta`;
  }

  async removeDirectory(directory: string) {
    if (!fs.existsSync(directory)) {
      return;
    }
    fs.readdirSync(directory).forEach((i) => {
      const path = directory + '/' + i;
      if (fs.statSync(path).isDirectory()) {
        this.removeDirectory(path);
      } else {
        fs.unlinkSync(path);
      }
    });
    await fs.rmdirSync(directory);
  }

  testLoop(): boolean {
    if (!fs.existsSync(this.goldenPath)) {
      return false;
    }
    if (!fs.existsSync(this.testingPath)) {
      return false;
    }
    if (fs.existsSync(this.deltaPath)) {
      this.removeDirectory(this.deltaPath);
    }
    fs.mkdirSync(`${this.deltaPath}`);

    let filesExist = false;
    let allPass = true;
    fs.readdirSync(this.goldenPath).forEach((i) => {
      const goldenFile = this.goldenPath + '/' + i;
      const testingFile = this.testingPath + '/' + i;
      const deltaFile = this.deltaPath + '/' + i;
      if (!fs.statSync(goldenFile).isDirectory()) {
        filesExist = true;
        if (!fs.existsSync(testingFile)) {
          allPass = false;
          return;
        }
        if (!this.diffPixs(goldenFile, testingFile, deltaFile)) {
          allPass = false;
          return;
        }
      }
    });
    return filesExist && allPass;
  }

  diffPixs(goldenFile: string, testingFile: string, deltaFile: string): boolean {
    const PNG = pngjs.PNG;
    const imgageGolden = PNG.sync.read(fs.readFileSync(`${goldenFile}`));
    const imgageCompare = PNG.sync.read(fs.readFileSync(`${testingFile}`));
    const { width, height } = imgageGolden;
    const diff = new PNG({ width, height });
    const numDiffPixels = pixelmatch(
      imgageGolden.data,
      imgageCompare.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );

    if (numDiffPixels > 0) {
      fs.writeFileSync(deltaFile, PNG.sync.write(diff));
      return false;
    }
    return true;
  }
}
