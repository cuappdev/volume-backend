/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable dot-notation */

import { faker } from '@faker-js/faker';
import { dbConnection, disconnectDB } from './data/TestingDBConnection';
import { DEFAULT_LIMIT } from '../common/constants';
import FactoryUtils from './data/FactoryUtils';
import FlyerFactory from './data/FlyerFactory';
import { FlyerModel } from '../entities/Flyer';
import FlyerRepo from '../repos/FlyerRepo';
import OrganizationFactory from './data/OrganizationFactory';
import OrganizationRepo from '../repos/OrganizationRepo';

beforeAll(async () => {
  await dbConnection();
  await OrganizationRepo.addOrganizationsToDB();
  await FlyerModel.createCollection();
  await FlyerModel.syncIndexes();
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
    flyers.sort(FactoryUtils.compareByStartDate);
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
    const org = await OrganizationFactory.getRandomOrganization();
    const flyers = await FlyerFactory.createSpecific(1, {
      organizationSlug: org.slug,
      organization: org,
    });
    await FlyerModel.insertMany(flyers);

    const getFlyersResponse = await FlyerRepo.getFlyersByOrganizationSlug(org.slug);
    expect(getFlyersResponse[0].title).toEqual(flyers[0].title);
  });

  test('getFlyersByOrganizationSlug - 1 organization, 3 flyers', async () => {
    const org = await OrganizationFactory.getRandomOrganization();
    const flyers = (
      await FlyerFactory.createSpecific(3, {
        organizationSlug: org.slug,
        organization: org,
      })
    ).sort(FactoryUtils.compareByStartDate);

    await FlyerModel.insertMany(flyers);
    const getFlyersResponse = await FlyerRepo.getFlyersByOrganizationSlug(org.slug);

    expect(FactoryUtils.mapToValue(getFlyersResponse, 'title')).toEqual(
      FactoryUtils.mapToValue(flyers, 'title'),
    );
  });
});

describe('getFlyersAfterDate tests', () => {
  test('getFlyersAfterDate - filter 1 flyer', async () => {
    const today = new Date();
    let flyers = await FlyerFactory.createSpecific(1, {
      endDate: faker.date.recent(1), // 1 day ago
    });
    flyers = flyers.concat(
      await FlyerFactory.createSpecific(1, {
        endDate: faker.date.past(1, today.getDate() - 2), // 1 year ago
      }),
    );
    await FlyerModel.insertMany(flyers);

    const getFlyersResponse = await FlyerRepo.getFlyersAfterDate(
      faker.date.recent(2, today.getDate() - 1).toString(),
    ); // find flyers from after 2 days ago
    expect(getFlyersResponse[0].title).toEqual(flyers[0].title);
  });
});

describe('getFlyersBeforeDate tests', () => {
  test('getFlyersBeforeDate - three flyers', async () => {
    const flyers = await FlyerFactory.createSpecific(3, {
      endDate: faker.date.past(1), // 1 year ago
    });
    await FlyerModel.insertMany(flyers);

    const getFlyersResponse = await FlyerRepo.getFlyersBeforeDate(faker.date.future(2).toString());
    expect(getFlyersResponse).toHaveLength(3);
  });
});

describe('searchFlyer tests', () => {
  test('searchFlyer - 1 flyer', async () => {
    const flyers = await FlyerFactory.create(1);
    await FlyerModel.insertMany(flyers);

    const getFlyersResponse = await FlyerRepo.searchFlyers(flyers[0].title);
    expect(getFlyersResponse[0].title).toEqual(flyers[0].title);
  });

  test('searchFlyer - expect 0 flyers', async () => {
    const flyers = await FlyerFactory.create(3);
    await FlyerModel.insertMany(flyers);

    const getFlyersResponse = await FlyerRepo.searchFlyers(Math.random().toString().substr(3, 20));
    expect(getFlyersResponse).toHaveLength(0);
  });

  test('searchFlyer - return at most limit number of flyers', async () => {
    const flyers = await FlyerFactory.createSpecific(DEFAULT_LIMIT + 1, {
      title: 'faker',
    });
    await FlyerModel.insertMany(flyers);

    const getFlyersResponse = await FlyerRepo.searchFlyers('faker');
    expect(getFlyersResponse).toHaveLength(DEFAULT_LIMIT);
  });
});

describe('incrementShoutouts tests', () => {
  test('incrementShoutouts - Shoutout 1 flyer', async () => {
    const flyers = await FlyerFactory.create(1);
    const oldClicks = flyers[0].timesClicked;
    const insertOutput = await FlyerModel.insertMany(flyers);

    await FlyerRepo.incrementTimesClicked(insertOutput[0]._id);

    const getFlyersResponse = await FlyerRepo.getFlyerByID(insertOutput[0]._id);
    expect(getFlyersResponse.timesClicked).toEqual(oldClicks + 1);
  });
});

describe('getTrending tests', () => {
  test('getTrendingFlyers - get 5 trending flyers', async () => {
    // Shuffle order of trendiness
    const randomTrendiness = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    // Create flyers with random trendiness
    const randomFlyers = await FlyerFactory.create(randomTrendiness.length);
    for (let i = 0; i < randomTrendiness.length; i++) {
      randomFlyers[i].trendiness = randomTrendiness[i];
    }
    await FlyerModel.insertMany(randomFlyers);

    const trendingFlyers = await FlyerRepo.getTrendingFlyers(randomTrendiness.length);
    for (let i = 0; i < randomTrendiness.length; i++) {
      expect(trendingFlyers[i].trendiness).toEqual(randomTrendiness.length - i - 1);
    }
  });
});

describe('getTrending tests', () => {
  test('getTrendingFlyers - make sure there are no out of date flyers', async () => {
    // Shuffle order of trendiness
    const randomTrendiness = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    // Create flyers with random trendiness
    const randomFlyers = await FlyerFactory.create(randomTrendiness.length);
    for (let i = 0; i < randomTrendiness.length; i++) {
      randomFlyers[i].trendiness = randomTrendiness[i];
    }
    const numOfOutOfDateTrendingFlyers = 3;
    // Create flyers that are out of date but have high trendiness:
    const outdatedFlyers = await FlyerFactory.createSpecific(numOfOutOfDateTrendingFlyers, {
      trendiness: 1000,
      title: 'outdated',
      endDate: new Date().setFullYear(new Date().getFullYear() - 1),
      startDate: new Date().setFullYear(new Date().getFullYear() - 1),
    });

    await FlyerModel.insertMany(randomFlyers);
    await FlyerModel.insertMany(outdatedFlyers);
    const trendingFlyers = await FlyerRepo.getTrendingFlyers(
      randomTrendiness.length + numOfOutOfDateTrendingFlyers,
    );
    for (let i = 0; i < randomTrendiness.length; i++) {
      expect(trendingFlyers[i].trendiness).not.toEqual(1000);
    }
  });
});
