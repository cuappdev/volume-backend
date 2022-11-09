/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable dot-notation */
import { ArticleModel } from '../entities/Article';
import ArticleRepo from '../repos/ArticleRepo';
import PublicationRepo from '../repos/PublicationRepo';
import ArticleFactory from './data/ArticleFactory';
import { dbConnection, disconnectDB } from './data/TestingDBConnection';

beforeAll(async () => {
  await dbConnection();
  await PublicationRepo.addPublicationsToDB();
  await ArticleModel.createCollection();
});

beforeEach(async () => {
  await ArticleModel.deleteMany({});
});

afterAll(async () => {
  await ArticleModel.deleteMany({}).then(() => {
    disconnectDB();
  });
});

describe('getAllArticle tests:', () => {
  test('getAllArticles - No articles', async () => {
    const getArticlesResponse = await ArticleRepo.getAllArticles();
    expect(getArticlesResponse).toHaveLength(0);
  });
  test('getAllArticles - 5 articles', async () => {
    const articles = await ArticleFactory.create(5);
    await ArticleModel.insertMany(articles);

    const getArticlesResponse = await ArticleRepo.getAllArticles();
    expect(getArticlesResponse).toHaveLength(5);
  });
  test('getAllArticles limit 2', async () => {
    const articles = await ArticleFactory.create(3);
    await ArticleModel.insertMany(articles);

    const getArticlesResponse = await ArticleRepo.getAllArticles(0, 2);
    expect(getArticlesResponse).toHaveLength(2);
  });

  test('getAllArticles - Sort by date desc, offset 2, limit 2', async () => {
    const articles = await ArticleFactory.create(5);
    articles.sort((a, b) => {
      return -1 * (new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    await ArticleModel.insertMany(articles);

    const articleTitles = articles.slice(2, 4).map((a) => {
      return a.title;
    }); // offset=2, limit=2

    const getArticlesResponse = await ArticleRepo.getAllArticles(2, 2);
    const respTitles = getArticlesResponse.map((a) => {
      return a.title;
    });
    expect(respTitles).toEqual(articleTitles);
  });
});
