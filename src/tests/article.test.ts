/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable dot-notation */
import { ArticleModel } from '../entities/Article';
import ArticleRepo from '../repos/ArticleRepo';
import PublicationRepo from '../repos/PublicationRepo';
import ArticleFactory from './data/ArticleFactory';
import PublicationFactory from './data/PublicationFactory';

import { dbConnection, disconnectDB } from './data/TestingDBConnection';

// Maps an array of mongo documents [x] to an array of x.[val]
function mapToValue(arr, val) {
  return arr.map((x) => {
    return x[val];
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setAllToValue(arr, newMappings: { [key: string]: any }) {
  return arr.map((x) => {
    const newDoc = x;
    Object.entries(newMappings).forEach(([k, v]) => {
      newDoc[k] = v;
    });
    return newDoc;
  });
}

function byDate(a, b) {
  return -1 * (new Date(a.date).getTime() - new Date(b.date).getTime());
}
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
    articles.sort(byDate);
    await ArticleModel.insertMany(articles);

    const articleTitles = mapToValue(articles.slice(2, 4), 'title'); // offset=2, limit=2

    const getArticlesResponse = await ArticleRepo.getAllArticles(2, 2);
    const respTitles = mapToValue(getArticlesResponse, 'title');

    expect(respTitles).toEqual(articleTitles);
  });
});

describe('getArticle(s)ByID(s) tests:', () => {
  test('getArticleByID - 1 article', async () => {
    const articles = await ArticleFactory.create(1);
    const insertOutput = await ArticleModel.insertMany(articles);
    const id = insertOutput[0]._id;

    const getArticlesResponse = await ArticleRepo.getArticleByID(id);
    expect(getArticlesResponse.title).toEqual(articles[0].title);
  });
  test('getArticlesByIDs - 3 articles', async () => {
    const articles = await ArticleFactory.create(3);
    const insertOutput = await ArticleModel.insertMany(articles);
    const ids = mapToValue(insertOutput, '_id');
    const getArticlesResponse = await ArticleRepo.getArticlesByIDs(ids);

    expect(mapToValue(getArticlesResponse, 'title')).toEqual(mapToValue(articles, 'title'));
  });
});
describe('getArticlesByPublicationSlug(s) tests', () => {
  test('getArticlesByPublicationSlug - 1 publication, 1 article', async () => {
    const pub = await PublicationFactory.getRandomPublication();
    const articles = setAllToValue(await ArticleFactory.create(1), {
      publicationSlug: pub.slug,
      publication: pub,
    });
    await ArticleModel.insertMany(articles);

    const getArticlesResponse = await ArticleRepo.getArticlesByPublicationSlug(pub.slug);
    expect(getArticlesResponse[0].title).toEqual(articles[0].title);
  });

  test('getArticlesByPublicationSlug - 1 publication, 3 articles', async () => {
    const pub = await PublicationFactory.getRandomPublication();
    const articles = setAllToValue(await ArticleFactory.create(3), {
      publicationSlug: pub.slug,
      publication: pub,
    }).sort(byDate);

    await ArticleModel.insertMany(articles);
    const getArticlesResponse = await ArticleRepo.getArticlesByPublicationSlug(pub.slug);

    expect(mapToValue(getArticlesResponse, 'title')).toEqual(mapToValue(articles, 'title'));
  });

  test('getArticlesByPublicationSlugs - many publications, 5 articles', async () => {
    const articles = (await ArticleFactory.create(3)).sort(byDate);

    await ArticleModel.insertMany(articles);
    const getArticlesResponse = await ArticleRepo.getArticlesByPublicationSlug(
      mapToValue(articles, 'publicationSlug'),
    );

    expect(mapToValue(getArticlesResponse, 'title')).toEqual(mapToValue(articles, 'title'));
  });
});
