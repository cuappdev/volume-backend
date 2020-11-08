import Parser from 'rss-parser';
import dotenv from 'dotenv';
import express from 'express';

const PORT = process.env.APP_PORT || 5000;

// load the environment variables from the .env file
dotenv.config({
    path: '.env',
});

const FEED_LIST = ['https://cornellsun.com/feed/',
                   'http://cunooz.com/?feed=rss2',
                   'http://theadvocatecornell.com/feed/',
                   'https://medium.com/feed/guac-magazine',
                   'https://www.cornellclaritas.com/blog?format=rss',
                   'https://www.culsr.org/?format=rss',
                   'https://www.cremedecornell.net/blogposts?format=rss',
                   'https://www.slopemedia.org/all?format=rss',
                   'https://www.thecornellreview.org/feed/',
                   'https://www.bigredsportsnetwork.org/feed/'
];

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