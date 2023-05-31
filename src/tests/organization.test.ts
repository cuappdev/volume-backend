/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable dot-notation */

import { _ } from 'underscore';
import { FlyerModel } from '../entities/Flyer';
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

describe('getAllOrganizations tests:', () => {
  test('getAllOrganizations', async () => {
    const orgs = await OrganizationFactory.getAllOrganizations();

    const getOrganizationsResponse = await OrganizationRepo.getAllOrganizations();
    expect(FactoryUtils.mapToValue(getOrganizationsResponse, 'slug')).toEqual(
      FactoryUtils.mapToValue(orgs, 'slug'),
    );
  });
});

describe('getMostRecentFlyer tests:', () => {
  test('getMostRecentFlyer - Out of 2-10 flyers', async () => {
    const org = await OrganizationRepo.getOrganizationBySlug(
      (await OrganizationFactory.getRandomOrganization()).slug,
    );
    const flyers = await FlyerFactory.createSpecific(_.random(2, 10), {
      organizationSlugs: [org.slug],
      organizations: [org],
    });
    await FlyerModel.insertMany(flyers);

    const getOrganizationsResponse = await OrganizationRepo.getMostRecentFlyer(org);
    const respDate = new Date(getOrganizationsResponse.startDate);

    const flyerDates = FactoryUtils.mapToValue(flyers, 'startDate');

    const isMin = flyerDates.every((d) => {
      return respDate.getTime() >= new Date(d).getTime();
    });

    expect(isMin).toBeTruthy();
  });
});

describe('getNumFlyer tests:', () => {
  test('getNumFlyer - 0 flyers', async () => {
    const org = await OrganizationRepo.getOrganizationBySlug(
      (await OrganizationFactory.getRandomOrganization()).slug,
    );

    const numResp = await OrganizationRepo.getNumFlyers(org);

    expect(numResp).toEqual(0);
  });

  test('getNumFlyer - Random number of flyers', async () => {
    const org1 = await OrganizationRepo.getOrganizationBySlug(
      (await OrganizationFactory.getRandomOrganization()).slug,
    );
    const org2 = await OrganizationRepo.getOrganizationBySlug(
      (await OrganizationFactory.getRandomOrganization()).slug,
    );
    const numFlyers = _.random(1, 10);
    const flyers = await FlyerFactory.createSpecific(numFlyers, {
      organizationSlugs: [org1.slug],
      organizations: [org1, org2],
    });
    await FlyerModel.insertMany(flyers);

    const numResp = await OrganizationRepo.getNumFlyers(org1);

    expect(numResp).toEqual(numFlyers);
  });
});

describe('getOrganizationByCategory tests:', () => {
  test('getOrganizationByCategory - 1 category', async () => {
    const org = await OrganizationFactory.getRandomOrganization();
    const { categorySlug } = org;

    const getOrganizationsResponse = await OrganizationRepo.getOrganizationsByCategory(
      categorySlug,
    );
    expect(FactoryUtils.mapToValue(getOrganizationsResponse, 'slug')).toContain(org.slug);
  });
});

describe('getOrganizationBySlug tests:', () => {
  test('getOrganizationBySlug - 1 org', async () => {
    const org = await OrganizationFactory.getRandomOrganization();

    const getOrganizationsResponse = await OrganizationRepo.getOrganizationBySlug(org.slug);

    expect(getOrganizationsResponse.slug).toEqual(org.slug);
  });
});

describe('getShoutouts tests:', () => {
  test('getShoutouts - Random number of flyers with 2 shoutouts, 1 org', async () => {
    const org = await OrganizationRepo.getOrganizationBySlug(
      (await OrganizationFactory.getRandomOrganization()).slug,
    );
    const numFlyers = _.random(1, 20);
    const numClicks = numFlyers * 2;
    const flyers = await FlyerFactory.createSpecific(numFlyers, {
      organizationSlugs: [org.slug],
      organizations: [org],
      timesClicked: 2,
    });
    await FlyerModel.insertMany(flyers);
    const getOrganizationsResponse = await OrganizationRepo.getClicks(org);

    expect(getOrganizationsResponse).toEqual(numClicks);
  });
});
