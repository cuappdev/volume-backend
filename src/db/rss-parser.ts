import Parser from 'rss-parser';
import { Article } from '../entities/Article';
import { PublicationModel } from '../entities/Publication';
import PublicationRepo from '../repos/PublicationRepo';

const getRecentArticles = async (): Promise<Article[]> => {
  const parser = new Parser();

  const nameToIDMap = {};
  const publicationsDB = await PublicationRepo.getAllPublications();

  const articleSources = [];
  for (const publication of publicationsDB) {
    const pubDoc = await PublicationModel.findOne({ rssName: publication.rssName }); // eslint-disable-line no-await-in-loop
    nameToIDMap[publication.rssName] = pubDoc.id;
    articleSources.push(publication.rssURL);
  }

  await Promise.all(articleSources);

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
            publicationID: nameToIDMap[publication.title]
              ? nameToIDMap[publication.title]
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
