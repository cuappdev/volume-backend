/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable dot-notation */
/* eslint-disable no-await-in-loop */
import { UserModel } from '../entities/User';
import UserRepo from '../repos/UserRepo';
import UserFactory from './data/UserFactory';
import PublicationRepo from '../repos/PublicationRepo';
import FactoryUtils from './data/FactoryUtils';
import { MagazineModel } from '../entities/Magazine';
import { ArticleModel } from '../entities/Article';
import { dbConnection, disconnectDB } from './data/TestingDBConnection';
import PublicationFactory from './data/PublicationFactory';
import MagazineFactory from './data/MagazineFactory';
import ArticleFactory from './data/ArticleFactory';
import { FlyerModel } from '../entities/Flyer';
import FlyerFactory from './data/FlyerFactory';
import OrganizationFactory from './data/OrganizationFactory';

beforeAll(async () => {
  await dbConnection();
  await PublicationRepo.addPublicationsToDB();
  await MagazineModel.createCollection();
  await UserModel.createCollection();
  await ArticleModel.createCollection();
  await FlyerModel.createCollection();
});

beforeEach(async () => {
  await UserModel.deleteMany({});
  await MagazineModel.deleteMany({});
  await ArticleModel.deleteMany({});
  await FlyerModel.deleteMany({});
});

afterAll(async () => {
  UserModel.deleteMany({});
  ArticleModel.deleteMany({});
  FlyerModel.deleteMany({});
  MagazineModel.deleteMany({}).then(disconnectDB);
});

describe('getUserByUUID test:', () => {
  test('getUserByUUID - 1 user', async () => {
    const user = await UserFactory.create(1);
    const insertOutput = await UserModel.insertMany(user);
    const id = insertOutput[0].uuid;

    const getUserResponse = await UserRepo.getUserByUUID(id);
    expect(getUserResponse.id).toEqual(insertOutput[0].id);
  });
});

describe('(un)followPublication tests:', () => {
  test('followPublication - 1 user, 1 publication', async () => {
    const publication = await PublicationFactory.getRandomPublication();
    const users = await UserFactory.create(1);
    await UserModel.insertMany(users);
    await UserRepo.followPublication(users[0].uuid, publication.slug);

    const getUserResponse = await UserRepo.getUsersFollowingPublication(publication.slug);
    expect(FactoryUtils.mapToValue(getUserResponse, 'uuid')).toEqual(
      FactoryUtils.mapToValue(users, 'uuid'),
    );
  });

  test('followPublication - 3 users, 1 publication', async () => {
    const publication = await PublicationFactory.getRandomPublication();
    const users = await UserFactory.create(3);
    await UserModel.insertMany(users);
    for (let i = 0; i < 3; i++) await UserRepo.followPublication(users[i].uuid, publication.slug);

    const getUsersResponse = await UserRepo.getUsersFollowingPublication(publication.slug);
    expect(FactoryUtils.mapToValue(getUsersResponse, 'uuid')).toEqual(
      FactoryUtils.mapToValue(users, 'uuid'),
    );
  });

  test('unfollowPublication - 1 user, 1 publication', async () => {
    const publication = await PublicationFactory.getRandomPublication();
    const users = await UserFactory.create(1);
    await UserModel.insertMany(users);

    await UserRepo.followPublication(users[0].uuid, publication.slug);
    await UserRepo.unfollowPublication(users[0].uuid, publication.slug);

    const getUsersResponse = await UserRepo.getUsersFollowingPublication(publication.slug);
    expect(getUsersResponse).toHaveLength(0);
  });

  test('unfollowPublication - 3 users, 1 publication', async () => {
    const publication = await PublicationFactory.getRandomPublication();
    const users = await UserFactory.create(3);
    await UserModel.insertMany(users);

    for (let i = 0; i < 3; i++) await UserRepo.followPublication(users[i].uuid, publication.slug);
    for (let i = 0; i < 2; i++) await UserRepo.unfollowPublication(users[i].uuid, publication.slug);

    const getUsersResponse = await UserRepo.getUsersFollowingPublication(publication.slug);
    expect(getUsersResponse).toHaveLength(1);
  });
});

describe('(un)followOrganization tests:', () => {
  test('followOrganization - 1 user, 1 organization', async () => {
    const organization = await OrganizationFactory.getRandomOrganization();
    const users = await UserFactory.create(1);
    await UserModel.insertMany(users);
    await UserRepo.followOrganization(users[0].uuid, organization.slug);

    const getUserResponse = await UserRepo.getUsersFollowingOrganization(organization.slug);
    expect(FactoryUtils.mapToValue(getUserResponse, 'uuid')).toEqual(
      FactoryUtils.mapToValue(users, 'uuid'),
    );
  });

  test('followOrganization - 3 users, 1 organization', async () => {
    const organization = await OrganizationFactory.getRandomOrganization();
    const users = await UserFactory.create(3);
    await UserModel.insertMany(users);
    for (let i = 0; i < 3; i++) await UserRepo.followOrganization(users[i].uuid, organization.slug);

    const getUsersResponse = await UserRepo.getUsersFollowingOrganization(organization.slug);
    expect(FactoryUtils.mapToValue(getUsersResponse, 'uuid')).toEqual(
      FactoryUtils.mapToValue(users, 'uuid'),
    );
  });

  test('unfollowOrganization - 1 user, 1 organization', async () => {
    const organization = await OrganizationFactory.getRandomOrganization();
    const users = await UserFactory.create(1);
    await UserModel.insertMany(users);

    await UserRepo.followOrganization(users[0].uuid, organization.slug);
    await UserRepo.unfollowOrganization(users[0].uuid, organization.slug);

    const getUsersResponse = await UserRepo.getUsersFollowingOrganization(organization.slug);
    expect(getUsersResponse).toHaveLength(0);
  });

  test('unfollowOrganization - 3 users, 1 organization', async () => {
    const organization = await OrganizationFactory.getRandomOrganization();
    const users = await UserFactory.create(3);
    await UserModel.insertMany(users);

    for (let i = 0; i < 3; i++) await UserRepo.followOrganization(users[i].uuid, organization.slug);
    for (let i = 0; i < 2; i++)
      await UserRepo.unfollowOrganization(users[i].uuid, organization.slug);

    const getUsersResponse = await UserRepo.getUsersFollowingOrganization(organization.slug);
    expect(getUsersResponse).toHaveLength(1);
  });
});

// testing with user.test.ts instead of a separate weekly debrief file because
// mutations are done with UserRepo, also because testing WeeklyDebrief requires
// mocking which isn't a priority as of right now
describe('weekly debrief tests:', () => {
  test('incrementShoutouts - 1 user, 1 shoutout', async () => {
    const users = await UserFactory.create(1);
    await UserModel.insertMany(users);
    await UserRepo.incrementShoutouts(users[0].uuid);

    // update database
    const pub = await PublicationFactory.getRandomPublication();
    await UserRepo.followPublication(users[0].uuid, pub.slug);

    const getUsersResponse = await UserRepo.getUserByUUID(users[0].uuid);
    expect(getUsersResponse.numShoutouts).toEqual(1);
  });

  test('appendReadFlyer', async () => {
    const users = await UserFactory.create(1);
    const flyers = await FlyerFactory.create(1);
    await UserModel.insertMany(users);
    const insertOutput = await FlyerModel.insertMany(flyers);
    await UserRepo.appendReadFlyer(users[0].uuid, insertOutput[0].id);

    // update database
    const pub = await PublicationFactory.getRandomPublication();
    await UserRepo.followPublication(users[0].uuid, pub.slug);

    const getUsersResponse = await UserRepo.getUserByUUID(users[0].uuid);
    expect(getUsersResponse.readFlyers).toHaveLength(1);
  });

  test('appendReadMagazine', async () => {
    const users = await UserFactory.create(1);
    const magazines = await MagazineFactory.create(1);
    await UserModel.insertMany(users);
    const insertOutput = await MagazineModel.insertMany(magazines);
    await UserRepo.appendReadMagazine(users[0].uuid, insertOutput[0].id);

    // update database
    const pub = await PublicationFactory.getRandomPublication();
    await UserRepo.followPublication(users[0].uuid, pub.slug);

    const getUsersResponse = await UserRepo.getUserByUUID(users[0].uuid);
    expect(getUsersResponse.readMagazines).toHaveLength(1);
  });

  test('appendReadArticle', async () => {
    const users = await UserFactory.create(1);
    const articles = await ArticleFactory.create(1);
    await UserModel.insertMany(users);
    const insertOutput = await ArticleModel.insertMany(articles);
    await UserRepo.appendReadArticle(users[0].uuid, insertOutput[0].id);

    // update database
    const pub = await PublicationFactory.getRandomPublication();
    await UserRepo.followPublication(users[0].uuid, pub.slug);

    const getUsersResponse = await UserRepo.getUserByUUID(users[0].uuid);
    expect(getUsersResponse.readArticles).toHaveLength(1);
  });
});

describe('(un)bookmark tests:', () => {
  test('bookmark articles - 1 user, 1 article', async () => {
    const users = await UserFactory.create(1);
    const articles = await ArticleFactory.create(1);
    await UserModel.insertMany(users);
    const insertOutput = await ArticleModel.insertMany(articles);
    await UserRepo.bookmarkArticle(users[0].uuid, insertOutput[0].id);

    // update database
    const pub = await PublicationFactory.getRandomPublication();
    await UserRepo.followPublication(users[0].uuid, pub.slug);

    const getUserResponse = await UserRepo.getUserByUUID(users[0].uuid);
    expect(getUserResponse.bookmarkedArticles).toHaveLength(1);
  });

  test('unbookmark articles - 1 user, 1 article', async () => {
    const users = await UserFactory.create(1);
    const articles = await ArticleFactory.create(1);
    await UserModel.insertMany(users);
    const insertOutput = await ArticleModel.insertMany(articles);
    await UserRepo.bookmarkArticle(users[0].uuid, insertOutput[0].id);

    // update database
    const pub = await PublicationFactory.getRandomPublication();
    await UserRepo.followPublication(users[0].uuid, pub.slug);

    await UserRepo.unbookmarkArticle(users[0].uuid, insertOutput[0].id);
    const getUserResponse = await UserRepo.getUserByUUID(users[0].uuid);
    expect(getUserResponse.bookmarkedArticles).toHaveLength(0);
  });

  test('bookmark articles2 - 1 user, 1 article', async () => {
    const users = await UserFactory.create(1);
    const articles = await ArticleFactory.create(1);
    await UserModel.insertMany(users);
    await ArticleModel.insertMany(articles);

    await UserRepo.bookmarkArticle(users[0].uuid, articles[0].id);
    await UserRepo.bookmarkArticle(users[0].uuid, articles[0].id);
    const getUserResponse = await UserRepo.getUserByUUID(users[0].uuid);
    expect(getUserResponse.bookmarkedArticles).toHaveLength(1);
  });

  test('unbookmark articles2 - 1 user, 1 article', async () => {
    const users = await UserFactory.create(1);
    const articles = await ArticleFactory.create(1);
    await UserModel.insertMany(users);
    await ArticleModel.insertMany(articles);

    await UserRepo.unbookmarkArticle(users[0].uuid, articles[0].id);
    const getUserResponse = await UserRepo.getUserByUUID(users[0].uuid);
    expect(getUserResponse.bookmarkedArticles).toHaveLength(0);
  });
});
