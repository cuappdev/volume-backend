import Parser from 'rss-parser';
import cheerio from 'cheerio';
import { Article } from '../entities/Article';
import { PublicationModel } from '../entities/Publication';
import PublicationRepo from '../repos/PublicationRepo';

const getRecentArticles = async (): Promise<Article[]> => {
  const parser = new Parser();

  const nameToSlugMap = {};
  const publicationsDB = await PublicationRepo.getAllPublications();

  const articleSources = [];
  for (const publication of publicationsDB) {
    const pubDoc = await PublicationModel.findOne({ rssName: publication.rssName }); // eslint-disable-line no-await-in-loop
    nameToSlugMap[publication.rssName] = pubDoc.slug;
    articleSources.push(publication.rssURL);
  }

  await Promise.all(articleSources);

  const parsedPublications = articleSources.map((articles) => {
    return parser.parseURL(articles);
  });

  const parseImage = function parseImage(content) {
    const $ = cheerio.load(content);
    const img = $('img').attr('src');
    return img || '';
  };

  const articlePromises = Promise.all(parsedPublications).then((publications) =>
    publications
      .map((publication) =>
        publication.items.map((article) =>
          Object.assign(new Article(), {
            articleURL: article.link,
            date: new Date(article.pubDate),
            imageURL: parseImage(
              article['content:encoded'] ? article['content:encoded'] : article.content,
            ),
            publicationSlug: nameToSlugMap[publication.title] || 'none',
            title: article.title,
          }),
        ),
      )
      .flat(),
  );
  return articlePromises;
};

export default getRecentArticles;
