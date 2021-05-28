import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as cors from 'cors';
import { index } from './extCicdController';

const port = '1999';
export let extServerCwd = '';
export let localServerCwd = '';

export class ExtCicdServer {

    constructor(cwd?: string) {
        if(cwd){
            extServerCwd = cwd;
        }else {
            localServerCwd = process.cwd();        
        }

        const app = express();
        app.use(cors());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(express.static(path.join(__dirname, 'public')));
        app.use('/index', index);

        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            const err = new Error('Not Found');
            next(err);
        });

        // development error handler
        if (app.get('env') === 'development') {
            app.use(function (err, req, res) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        }

        app.set('port', process.env.PORT || port);
        app.listen(app.get('port'), function () {
            console.log('listening on port: ' + port);
        });
    }
}

