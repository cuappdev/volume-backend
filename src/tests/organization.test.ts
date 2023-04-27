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
    const pubs = await OrganizationFactory.getAllOrganizations();

    const getOrganizationsResponse = await OrganizationRepo.getAllOrganizations();
    expect(FactoryUtils.mapToValue(getOrganizationsResponse, 'slug')).toEqual(
      FactoryUtils.mapToValue(pubs, 'slug'),
    );
  });
});

describe('getMostRecentFlyer tests:', () => {
  test('getMostRecentFlyer - Out of 2-10 flyers', async () => {
    const pub = await OrganizationRepo.getOrganizationBySlug(
      (await OrganizationFactory.getRandomOrganization()).slug,
    );
    const flyers = await FlyerFactory.createSpecific(_.random(2, 10), {
      organizationSlug: pub.slug,
      organization: pub,
    });
    await FlyerModel.insertMany(flyers);

    const getOrganizationsResponse = await OrganizationRepo.getMostRecentFlyer(pub);
    const respDate = new Date(getOrganizationsResponse.date);

    const flyerDates = FactoryUtils.mapToValue(flyers, 'date');

    const isMin = flyerDates.every((d) => {
      return respDate.getTime() >= new Date(d).getTime();
    });

    expect(isMin).toBeTruthy();
  });
});

describe('getNumFlyer tests:', () => {
  test('getNumFlyer - 0 flyers', async () => {
    const pub = await OrganizationRepo.getOrganizationBySlug(
      (await OrganizationFactory.getRandomOrganization()).slug,
    );

    const numResp = await OrganizationRepo.getNumFlyers(pub);

    expect(numResp).toEqual(0);
  });

  test('getNumFlyer - Random number of flyers', async () => {
    const pub = await OrganizationRepo.getOrganizationBySlug(
      (await OrganizationFactory.getRandomOrganization()).slug,
    );
    const numFlyers = _.random(1, 10);
    const flyers = await FlyerFactory.createSpecific(numFlyers, {
      organizationSlug: pub.slug,
      organization: pub,
    });
    await FlyerModel.insertMany(flyers);

    const numResp = await OrganizationRepo.getNumFlyers(pub);

    expect(numResp).toEqual(numFlyers);
  });
});

describe('getOrganizationBySlug tests:', () => {
  test('getOrganizationBySlug - 1 pub', async () => {
    const pub = await OrganizationFactory.getRandomOrganization();

    const getOrganizationsResponse = await OrganizationRepo.getOrganizationBySlug(pub.slug);

    expect(getOrganizationsResponse.slug).toEqual(pub.slug);
  });
});

describe('getShoutouts tests:', () => {
  test('getShoutouts - Random number of flyers with 2 shoutouts, 1 pub', async () => {
    const pub = await OrganizationRepo.getOrganizationBySlug(
      (await OrganizationFactory.getRandomOrganization()).slug,
    );
    const numFlyers = _.random(1, 20);
    const numShoutouts = numFlyers * 2;
    const flyers = await FlyerFactory.createSpecific(numFlyers, {
      organizationSlug: pub.slug,
      organization: pub,
      shoutouts: 2,
    });
    await FlyerModel.insertMany(flyers);
    const getOrganizationsResponse = await OrganizationRepo.getShoutouts(pub);

    expect(getOrganizationsResponse).toEqual(numShoutouts);
  });
});
