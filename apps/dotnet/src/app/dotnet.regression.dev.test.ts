import { ART } from '@promatrix/testing';
import * as util from 'util';
import * as child_process from 'child_process';
const exec = util.promisify(child_process.exec);

const project = 'dotnet';
const actions = 'actionsQueue003';
const port = '7779';
const snaphots = 'testing';
const envCwd = 'apps';

jest.setTimeout(180000);

it('pixel comparison of snapshots', async () => {
  await testing((passed) => {
    expect(passed).toBeTruthy();
  });
});

async function testing(completed: (b: boolean) => void) {
  const snapshotsCli = `./dist/libs/utilities/src/lib/snapshotsCli ${project} ${actions} ${port} ${snaphots} ${envCwd}`;
  await exec(`node ${snapshotsCli}`);
  const art = new ART(envCwd, project, actions);
  const passed = art.testLoop();
  completed(passed);
}
// Timestamp: 5/25/2021-10:29:42 AM