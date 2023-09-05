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
    const trendingFlyers = await FlyerFactory.createSpecific(5, {
      isTrending: true,
    });
    const notTrendingFlyers = await FlyerFactory.createSpecific(5, {
      isTrending: false,
    });
    await FlyerModel.insertMany(trendingFlyers);
    await FlyerModel.insertMany(notTrendingFlyers);

    const getFlyersResponse = await FlyerRepo.getTrendingFlyers();
    expect(getFlyersResponse).toHaveLength(5);
  });

  describe('getFlyersByCategorySlug tests', () => {
    test('query flyer with invalid slug', async () => {
      const flyers = await FlyerFactory.create(2);
      await FlyerModel.insertMany(flyers);

      const getFlyersResponse = await FlyerRepo.getFlyersByCategorySlug(Math.random().toString());
      expect(getFlyersResponse).toHaveLength(0);
    });

    test('query flyer with existing slug', async () => {
      const flyers = await FlyerFactory.create(4);
      await FlyerModel.insertMany(flyers);

      const randomSlug = Math.random().toString();
      const specificFlyer = await FlyerFactory.createSpecific(1, { categorySlug: randomSlug });
      await FlyerModel.insertMany(specificFlyer);

      const getFlyersResponse = await FlyerRepo.getFlyersByCategorySlug(randomSlug);
      expect(getFlyersResponse[0].categorySlug).toEqual(specificFlyer[0].categorySlug);
      expect(getFlyersResponse).toHaveLength(1);
    });

    test('query multiple flyers with existing slug', async () => {
      const flyers = await FlyerFactory.create(4);
      await FlyerModel.insertMany(flyers);

      const randomSlug = Math.random().toString();
      const specificFlyer = await FlyerFactory.createSpecific(4, { categorySlug: randomSlug });
      await FlyerModel.insertMany(specificFlyer);

      const limit = 2;
      const getFlyersResponse = await FlyerRepo.getFlyersByCategorySlug(
        flyers[0].categorySlug,
        limit,
      );
      expect(getFlyersResponse).toHaveLength(limit);
    });
  });
});
