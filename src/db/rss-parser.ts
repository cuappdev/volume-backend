import { Article } from '../entities/Article';
import Parser from 'rss-parser';
import publications from '../../publications.json';

const getRecentArticles = async (): Promise<Article[]> => {
  const parser = new Parser();

  const feedSources = new Array<string>();
  for (const pc in publications) {
    if (publications[pc].feed) {
      feedSources.push(publications[pc].feed);
    }
  }

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
        article.date = new Date(item.pubDate).toISOString();
        article.imageURL = '';
        article.likes = 0;

        // Double check if RSS feeds have changed name
        article.publication = publications[feed.title] ? publications[feed.title].slug : 'unknown';

        articles.push(article);
      });
    });

    return articles;
  });

  return articlePromises;
};

export default getRecentArticles;
