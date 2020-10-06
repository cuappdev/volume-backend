import dotenv from 'dotenv';
import express from 'express';
import Parser from 'rss-parser';

const PORT = process.env.APP_PORT || 5000;

// load the environment variables from the .env file
dotenv.config({
    path: '.env',
});

const FEED_LIST = ['https://cornellsun.com/feed/'];

const app = express();

app.get('/', (req, res) => {
    const parser = new Parser();

    const feedRequests = FEED_LIST.map((feed) => {
        return parser.parseURL(feed);
    });

    Promise.all(feedRequests).then((response) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET');
        res.json(response);
    });
}).listen(PORT, () => console.log(`Listening on ${PORT}`));
