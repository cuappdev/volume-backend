import Parser from 'rss-parser';
import * as publications from '../../publications.json';

import { Article } from '../entities/Article';

const getRecentArticles = async (): Promise<Article[]> => {
  const parser = new Parser();

  const publicationsDB = publications.publications;
  const nameToSlugMap = {};
  const feedSources = publicationsDB.map((publication) => {
    nameToSlugMap[publication['rss-name']] = publication.slug;
    return publication.feed;
  });

  const feedRequests = feedSources.map((feed) => {
    return parser.parseURL(feed);
  });

  const articlePromises = Promise.all(feedRequests).then((feeds) => {
    const articles = new Array<Article>();

    feeds.map((feed) => {
      feed.items.map((item) => {
        const article = new Article();
        article.title = item.title;
        article.articleURL = item.link;
        article.date = new Date(item.pubDate);
        article.imageURL = '';
        article.likes = 0;

        // Double check if RSS feeds have changed name
        article.publication = nameToSlugMap[feed.title] ? nameToSlugMap[feed.title] : 'unknown';

        articles.push(article);
      });
    });

    return articles;
  });

  return articlePromises;
};

export default getRecentArticles;
