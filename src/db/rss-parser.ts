import Parser from 'rss-parser';
import { Article } from '../entities/Article';
import { PublicationModel } from '../entities/Publication';
import PublicationRepo from '../repos/PublicationRepo';

const getRecentArticles = async (): Promise<Article[]> => {
  const parser = new Parser();

  const publicationsDB = await PublicationRepo.getAllPublications();
  const articleSources = publicationsDB.map(({ rssURL }) => {
    return rssURL;
  });

  const parsedPublications = articleSources.map((articles) => {
    return parser.parseURL(articles);
  });

  const articlePromises = Promise.all(parsedPublications).then((publications) =>
    publications
      .map((publication) =>
        publication.items.map(async (article) => {
          const pub = await PublicationModel.findOne({ rssName: publication.title }).exec();
          return Object.assign(new Article(), {
            articleURL: article.link,
            date: new Date(article.pubDate),
            imageURL: '',
            shoutouts: 0,
            publicationID: pub.id ? pub.id : 'unknown',
            title: article.title,
          });
        }),
      )
      .flat(),
  );

  return articlePromises;
};

export default getRecentArticles;
