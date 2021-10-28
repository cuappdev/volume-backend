import Parser from 'rss-parser';
import cheerio from 'cheerio';
import { Article } from '../entities/Article';
import { Publication } from '../entities/Publication';
import PublicationRepo from '../repos/PublicationRepo';

const getRecentArticles = async (): Promise<Article[]> => {
  const parser = new Parser();

  const publicationsDB = await PublicationRepo.getAllPublications();
  const parsedPublications = publicationsDB.map((pub) => parser.parseURL(pub.rssURL));

  const parseImage = function sparseImage(content) {
    const $ = cheerio.load(content);
    const img = $('img').attr('src');
    return img || '';
  };
  const articlePromises = Promise.all(parsedPublications).then((publications) => {
    return publications
      .map((publication, i) =>
        publication.items.map((article) =>
          Object.assign(new Article(), {
            articleURL: article.link,
            date: new Date(article.pubDate),
            imageURL: parseImage(
              article['content:encoded'] ? article['content:encoded'] : article.content,
            ),
            publication: Object.assign(new Publication(), {
              slug: publicationsDB[i].slug,
              backgroundImageURL: publicationsDB[i].backgroundImageURL,
              bio: publicationsDB[i].bio,
              bioShort: publicationsDB[i].bioShort,
              name: publicationsDB[i].name,
              profileImageURL: publicationsDB[i].profileImageURL,
              rssName: publicationsDB[i].rssName,
              rssURL: publicationsDB[i].rssURL,
              websiteURL: publicationsDB[i].websiteURL,
            }),
            title: article.title,
          }),
        ),
      )
      .flat();
  });

  return articlePromises;
};

export default getRecentArticles;
