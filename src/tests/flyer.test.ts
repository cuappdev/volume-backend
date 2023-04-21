/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable dot-notation */
import { faker } from '@faker-js/faker';
import { FlyerModel } from '../entities/Flyer';
import FlyerRepo from '../repos/FlyerRepo';
import OrganizationRepo from '../repos/OrganizationRepo';
import FactoryUtils from './data/FactoryUtils';
import FlyerFactory from './data/FlyerFactory';
import OrganizationFactory from './data/OrganizationFactory';

import { dbConnection, disconnectDB } from './data/TestingDBConnection';

beforeAll(async () => {
  await dbConnection();
  await OrganizationRepo.addOrganizationsToDB();
  await FlyerModel.createCollection();
});

beforeEach(async () => {
  await FlyerModel.deleteMany({});
});

afterAll(async () => {
  FlyerModel.deleteMany({}).then(disconnectDB);
});

describe('getAllFlyer tests:', () => {
  test('getAllFlyers - No flyers', async () => {
    const getFlyersResponse = await FlyerRepo.getAllFlyers();
    expect(getFlyersResponse).toHaveLength(0);
  });
  test('getAllFlyers - 5 flyers', async () => {
    const flyers = await FlyerFactory.create(5);
    await FlyerModel.insertMany(flyers);

    const getFlyersResponse = await FlyerRepo.getAllFlyers();
    expect(getFlyersResponse).toHaveLength(5);
  });
  test('getAllFlyers limit 2', async () => {
    const flyers = await FlyerFactory.create(3);
    await FlyerModel.insertMany(flyers);

    const getFlyersResponse = await FlyerRepo.getAllFlyers(0, 2);
    expect(getFlyersResponse).toHaveLength(2);
  });
  test('getAllFlyers - Sort by date desc, offset 2, limit 2', async () => {
    const flyers = await FlyerFactory.create(5);
    flyers.sort(FactoryUtils.compareByDate);
    await FlyerModel.insertMany(flyers);

    const flyerTitles = FactoryUtils.mapToValue(flyers.slice(2, 4), 'title'); // offset=2, limit=2

    const getFlyersResponse = await FlyerRepo.getAllFlyers(2, 2);
    const respTitles = FactoryUtils.mapToValue(getFlyersResponse, 'title');

    expect(respTitles).toEqual(flyerTitles);
  });
});

describe('getFlyer(s)ByID(s) tests:', () => {
  test('getFlyerByID - 1 flyer', async () => {
    const flyers = await FlyerFactory.create(1);
    const insertOutput = await FlyerModel.insertMany(flyers);
    const id = insertOutput[0]._id;

    const getFlyersResponse = await FlyerRepo.getFlyerByID(id);
    expect(getFlyersResponse.title).toEqual(flyers[0].title);
  });
  test('getFlyersByIDs - 3 flyers', async () => {
    const flyers = await FlyerFactory.create(3);
    const insertOutput = await FlyerModel.insertMany(flyers);
    const ids = FactoryUtils.mapToValue(insertOutput, '_id');
    const getFlyersResponse = await FlyerRepo.getFlyersByIDs(ids);

    expect(FactoryUtils.mapToValue(getFlyersResponse, 'title')).toEqual(
      FactoryUtils.mapToValue(flyers, 'title'),
    );
  });
});

describe('getFlyersByOrganizationSlug(s) tests', () => {
  test('getFlyersByOrganizationSlug - 1 organization, 1 flyer', async () => {
    const pub = await OrganizationFactory.getRandomOrganization();
    const flyers = await FlyerFactory.createSpecific(1, {
      organizationSlug: pub.slug,
      organization: pub,
    });
    await FlyerModel.insertMany(flyers);

    const getFlyersResponse = await FlyerRepo.getFlyersByOrganizationSlug(pub.slug);
    expect(getFlyersResponse[0].title).toEqual(flyers[0].title);
  });

  test('getFlyersByOrganizationSlug - 1 organization, 3 flyers', async () => {
    const pub = await OrganizationFactory.getRandomOrganization();
    const flyers = (
      await FlyerFactory.createSpecific(3, {
        organizationSlug: pub.slug,
        organization: pub,
      })
    ).sort(FactoryUtils.compareByDate);

    await FlyerModel.insertMany(flyers);
    const getFlyersResponse = await FlyerRepo.getFlyersByOrganizationSlug(pub.slug);

    expect(FactoryUtils.mapToValue(getFlyersResponse, 'title')).toEqual(
      FactoryUtils.mapToValue(flyers, 'title'),
    );
  });

  test('getFlyersByOrganizationSlugs - many organizations, 5 flyers', async () => {
    const flyers = (await FlyerFactory.create(3)).sort(FactoryUtils.compareByDate);

    await FlyerModel.insertMany(flyers);
    const getFlyersResponse = await FlyerRepo.getFlyersByOrganizationSlug(
      FactoryUtils.mapToValue(flyers, 'organizationSlug'),
    );

    expect(FactoryUtils.mapToValue(getFlyersResponse, 'title')).toEqual(
      FactoryUtils.mapToValue(flyers, 'title'),
    );
  });
});

describe('getFlyersAfterDate tests', () => {
  test('getFlyersAfterDate - filter 1 flyer', async () => {
    const today = new Date();
    let flyers = await FlyerFactory.createSpecific(1, {
      date: faker.date.recent(1), // 1 day ago
    });
    flyers = flyers.concat(
      await FlyerFactory.createSpecific(1, {
        date: faker.date.past(1, today.getDate() - 2), // 1 year ago
      }),
    );
    await FlyerModel.insertMany(flyers);

    const getFlyersResponse = await FlyerRepo.getFlyersAfterDate(
      faker.date.recent(2, today.getDate() - 1).toString(),
    ); // find flyers from after 2 days ago
    expect(getFlyersResponse[0].title).toEqual(flyers[0].title);
  });
});

describe('searchFlyer tests', () => {
  test('searchFlyer - 1 flyer', async () => {
    const flyers = await FlyerFactory.create(1);
    await FlyerModel.insertMany(flyers);

    const getFlyersResponse = await FlyerRepo.searchFlyers(flyers[0].title);
    expect(getFlyersResponse[0].title).toEqual(flyers[0].title);
  });
});

describe('incrementShoutouts tests', () => {
  test('incrementShoutouts - Shoutout 1 flyer', async () => {
    const flyers = await FlyerFactory.create(1);
    const oldShoutouts = flyers[0].shoutouts;
    const insertOutput = await FlyerModel.insertMany(flyers);

    await FlyerRepo.incrementShoutouts(insertOutput[0]._id);

    const getFlyersResponse = await FlyerRepo.getFlyerByID(insertOutput[0]._id);
    expect(getFlyersResponse.shoutouts).toEqual(oldShoutouts + 1);
  });
});