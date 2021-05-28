import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import * as express from 'express';
import * as https from 'https';
import * as cors from 'cors';
import * as streams from 'memory-streams';
import * as bodyParser from 'body-parser';

const router = express();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cors({ origin: true }));

router.post('/download', (request: Request, response: Response) => {
    const writer = new streams.WritableStream();
    https.get(request.body.fileUrl, (res) => {
        res.on('data', (chunk) => {
            writer.write(chunk);
        });

        res.on('end', () => {
            writer.end();
            response.setHeader('Content-Disposition', 'attachment; filename=' + request.body.fileName);
            const buffer = Buffer.from(writer.toBuffer());
            response.status(200).send(buffer);
        })

    }).on('error', (e) => {
        response.status(500).send(e.message);
    });
});

router.get('/serverTime', function (req, res) {
    // return the server time in ms since 1970
    const date = new Date();
    const milliseconds = date.getTime();
    const zoneOffset = date.getTimezoneOffset();
    res.status(200).json({ milliseconds, zoneOffset });
});

export const index = functions.https.onRequest(router);