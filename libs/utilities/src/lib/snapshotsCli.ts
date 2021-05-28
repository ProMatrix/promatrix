import { Snapshots } from './snapshots';
export class SnapshotsCli {

    constructor() {
        try {
            if(process.argv.length !== 7){
                throw new Error('Error: cli argument list is wrong!');
            }
            new Snapshots(process.argv[2], process.argv[3], parseInt(process.argv[4]), process.argv[5], process.argv[6]);
        } catch (error) {
            console.error(`\n\n${error.message}\n`);
        }
    }
}
new SnapshotsCli();