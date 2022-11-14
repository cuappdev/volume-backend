/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable dot-notation */
import { faker } from '@faker-js/faker';
import { ArticleModel } from '../entities/Article';
import ArticleRepo from '../repos/ArticleRepo';
import PublicationRepo from '../repos/PublicationRepo';
import ArticleFactory from './data/ArticleFactory';
import FactoryUtils from './data/FactoryUtils';
import PublicationFactory from './data/PublicationFactory';

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
  ArticleModel.deleteMany({}).then(disconnectDB);
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
    articles.sort(FactoryUtils.compareByDate);
    await ArticleModel.insertMany(articles);

    const articleTitles = FactoryUtils.mapToValue(articles.slice(2, 4), 'title'); // offset=2, limit=2

    const getArticlesResponse = await ArticleRepo.getAllArticles(2, 2);
    const respTitles = FactoryUtils.mapToValue(getArticlesResponse, 'title');

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
    const ids = FactoryUtils.mapToValue(insertOutput, '_id');
    const getArticlesResponse = await ArticleRepo.getArticlesByIDs(ids);

    expect(FactoryUtils.mapToValue(getArticlesResponse, 'title')).toEqual(
      FactoryUtils.mapToValue(articles, 'title'),
    );
  });
});

describe('getArticlesByPublicationSlug(s) tests', () => {
  test('getArticlesByPublicationSlug - 1 publication, 1 article', async () => {
    const pub = await PublicationFactory.getRandomPublication();
    const articles = await ArticleFactory.createSpecific(1, {
      publicationSlug: pub.slug,
      publication: pub,
    });
    await ArticleModel.insertMany(articles);

    const getArticlesResponse = await ArticleRepo.getArticlesByPublicationSlug(pub.slug);
    expect(getArticlesResponse[0].title).toEqual(articles[0].title);
  });

  test('getArticlesByPublicationSlug - 1 publication, 3 articles', async () => {
    const pub = await PublicationFactory.getRandomPublication();
    const articles = (
      await ArticleFactory.createSpecific(3, {
        publicationSlug: pub.slug,
        publication: pub,
      })
    ).sort(FactoryUtils.compareByDate);

    await ArticleModel.insertMany(articles);
    const getArticlesResponse = await ArticleRepo.getArticlesByPublicationSlug(pub.slug);

    expect(FactoryUtils.mapToValue(getArticlesResponse, 'title')).toEqual(
      FactoryUtils.mapToValue(articles, 'title'),
    );
  });

  test('getArticlesByPublicationSlugs - many publications, 5 articles', async () => {
    const articles = (await ArticleFactory.create(3)).sort(FactoryUtils.compareByDate);

    await ArticleModel.insertMany(articles);
    const getArticlesResponse = await ArticleRepo.getArticlesByPublicationSlug(
      FactoryUtils.mapToValue(articles, 'publicationSlug'),
    );

    expect(FactoryUtils.mapToValue(getArticlesResponse, 'title')).toEqual(
      FactoryUtils.mapToValue(articles, 'title'),
    );
  });
});

describe('getArticlesAfterDate tests', () => {
  test('getArticlesAfterDate - filter 1 article', async () => {
    const today = new Date();
    let articles = await ArticleFactory.createSpecific(1, {
      date: faker.date.recent(1), // 1 day ago
    });
    articles = articles.concat(
      await ArticleFactory.createSpecific(1, {
        date: faker.date.past(1, today.getDate() - 2), // 1 year ago
      }),
    );
    await ArticleModel.insertMany(articles);

    const getArticlesResponse = await ArticleRepo.getArticlesAfterDate(
      faker.date.recent(2, today.getDate() - 1).toString(),
    ); // find articles from after 2 days ago
    expect(getArticlesResponse[0].title).toEqual(articles[0].title);
  });
});

describe('searchArticle tests', () => {
  test('searchArticle - 1 article', async () => {
    const articles = await ArticleFactory.create(1);
    await ArticleModel.insertMany(articles);

    const getArticlesResponse = await ArticleRepo.searchArticles(articles[0].title);
    expect(getArticlesResponse[0].title).toEqual(articles[0].title);
  });
});

describe('incrementShoutouts tests', () => {
  test('incrementShoutouts - Shoutout 1 article', async () => {
    const articles = await ArticleFactory.create(1);
    const oldShoutouts = articles[0].shoutouts;
    const insertOutput = await ArticleModel.insertMany(articles);

    await ArticleRepo.incrementShoutouts(insertOutput[0]._id);

    const getArticlesResponse = await ArticleRepo.getArticleByID(insertOutput[0]._id);
    expect(getArticlesResponse.shoutouts).toEqual(oldShoutouts + 1);
  });
});
