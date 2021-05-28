import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import { index } from './ngFireRemoteController';
const cors = require('cors');
const port = '2001';

export class NgFireRemoteServer {
    constructor() {
        var app = express();
        app.use(cors());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(express.static(path.join(__dirname, 'public')));
        app.use('/index', index);

        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            var err = new Error('Not Found');
            next(err);
        });

        // TODO
        // development error handler
        if (app.get('env') === 'development') {
            app.use(function (err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        }

        app.set('port', process.env.PORT || port);
        const server = app.listen(app.get('port'), function () {
            console.log('listening on port: ' + server.address().port);
        });
    }
}