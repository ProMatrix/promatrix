import { ART } from '@promatrix/testing';
import * as util from 'util';
import * as child_process from 'child_process';
const exec = util.promisify(child_process.exec);

const project = 'cicd';
const port = '7776';
const snaphots = 'testing';
const envCwd = 'apps';

jest.setTimeout(180000);

it('pixel comparison of snapshot', async () => {
  await testing((passed) => {
    expect(passed).toBeTruthy();
  });
});

async function testing(completed: (b: boolean) => void) {
  const snapshotCli = `./dist/libs/utilities/src/lib/snapshotCli ${project} ${port} ${snaphots} ${envCwd}`;
  await exec(`node ${snapshotCli}`);
  const art = new ART(envCwd, project);
  const passed = art.testLoop();
  completed(passed);
}
// Timestamp: 5/25/2021-5:41:13 AM