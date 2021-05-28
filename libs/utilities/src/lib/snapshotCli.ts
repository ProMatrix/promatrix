import { Snapshot } from './snapshot';
export class SnapshotCli {

    constructor() {
        try {
            if (process.argv.length !== 6) {
                throw new Error('Error: cli argument list is wrong!');
            }
            new Snapshot(process.argv[2], parseInt(process.argv[3]), process.argv[4], process.argv[5]);
        } catch (error) {
            console.error(`\n\n${error.message}\n`);
        }
    }

}
new SnapshotCli();