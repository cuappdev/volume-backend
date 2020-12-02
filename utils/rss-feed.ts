import Parser from 'rss-parser';
import express from 'express';
import publicationsJSON from '../publications.json';

const PORT = 5000;

const publicationsDB = publicationsJSON.publications;
const FEED_LIST = publicationsDB.map((publication) => {
    return publication.rssURL;
});

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