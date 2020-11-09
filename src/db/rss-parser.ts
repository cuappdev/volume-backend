import Parser from 'rss-parser';
import { Article } from '../entities/Article';
import publicationsJSON from '../../publications.json';

const getRecentArticles = async (): Promise<Article[]> => {
  const parser = new Parser();

  const publicationsDB = publicationsJSON.publications;
  const nameToSlugMap = {};
  const articleSources = publicationsDB.map((publication) => {
    nameToSlugMap[publication['rss-name']] = publication.slug;
    return publication.rssURL;
  });

  const parsedPublications = articleSources.map((articles) => {
    return parser.parseURL(articles);
  });

  const articlePromises = Promise.all(parsedPublications).then((publications) =>
    publications
      .map((publication) =>
        publication.items.map((article) =>
          Object.assign(new Article(), {
            articleURL: article.link,
            date: new Date(article.pubDate),
            imageURL: '',
            shoutouts: 0,
            publication: nameToSlugMap[publication.title]
              ? nameToSlugMap[publication.title]
              : 'unknown',
            title: article.title,
          }),
        ),
      )
      .flat(),
  );

  return articlePromises;
};

export default getRecentArticles;
