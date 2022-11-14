/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable dot-notation */

import { _ } from 'underscore';
import { ArticleModel } from '../entities/Article';
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

describe('getAllPublications tests:', () => {
  test('getAllPublications', async () => {
    const pubs = await PublicationFactory.getAllPublications();

    const getPublicationsResponse = await PublicationRepo.getAllPublications();
    expect(FactoryUtils.mapToValue(getPublicationsResponse, 'slug')).toEqual(
      FactoryUtils.mapToValue(pubs, 'slug'),
    );
  });
});

describe('getMostRecentArticle tests:', () => {
  test('getMostRecentArticle - Out of 2-10 articles', async () => {
    const pub = await PublicationRepo.getPublicationBySlug(
      (await PublicationFactory.getRandomPublication()).slug,
    );
    const articles = await ArticleFactory.createSpecific(_.random(2, 10), {
      publicationSlug: pub.slug,
      publication: pub,
    });
    await ArticleModel.insertMany(articles);

    const getPublicationsResponse = await PublicationRepo.getMostRecentArticle(pub);
    const respDate = new Date(getPublicationsResponse.date);

    const articleDates = FactoryUtils.mapToValue(articles, 'date');

    const isMin = articleDates.every((d) => {
      return respDate.getTime() >= new Date(d).getTime();
    });

    expect(isMin).toBeTruthy();
  });
});

describe('getNumArticle tests:', () => {
  test('getNumArticle - 0 articles', async () => {
    const pub = await PublicationRepo.getPublicationBySlug(
      (await PublicationFactory.getRandomPublication()).slug,
    );

    const numResp = await PublicationRepo.getNumArticles(pub);

    expect(numResp).toEqual(0);
  });

  test('getNumArticle - Random number of articles', async () => {
    const pub = await PublicationRepo.getPublicationBySlug(
      (await PublicationFactory.getRandomPublication()).slug,
    );
    const numArticles = _.random(1, 10);
    const articles = await ArticleFactory.createSpecific(numArticles, {
      publicationSlug: pub.slug,
      publication: pub,
    });
    await ArticleModel.insertMany(articles);

    const numResp = await PublicationRepo.getNumArticles(pub);

    expect(numResp).toEqual(numArticles);
  });
});

describe('getPublicationBySlug tests:', () => {
  test('getPublicationBySlug - 1 pub', async () => {
    const pub = await PublicationFactory.getRandomPublication();

    const getPublicationsResponse = await PublicationRepo.getPublicationBySlug(pub.slug);

    expect(getPublicationsResponse.slug).toEqual(pub.slug);
  });
});

describe('getShoutouts tests:', () => {
  test('getShoutouts - Random number of articles with 2 shoutouts, 1 pub', async () => {
    const pub = await PublicationRepo.getPublicationBySlug(
      (await PublicationFactory.getRandomPublication()).slug,
    );
    const numArticles = _.random(1, 20);
    const numShoutouts = numArticles * 2;
    const articles = await ArticleFactory.createSpecific(numArticles, {
      publicationSlug: pub.slug,
      publication: pub,
      shoutouts: 2,
    });
    await ArticleModel.insertMany(articles);
    const getPublicationsResponse = await PublicationRepo.getShoutouts(pub);

    expect(getPublicationsResponse).toEqual(numShoutouts);
  });
});
