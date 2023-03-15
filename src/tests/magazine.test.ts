/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable dot-notation */
import { _ } from 'underscore';
import { MagazineModel } from '../entities/Magazine';
import MagazineRepo from '../repos/MagazineRepo';
import MagazineFactory from './data/MagazineFactory';
import PublicationRepo from '../repos/PublicationRepo';
import PublicationFactory from './data/PublicationFactory';
import FactoryUtils from './data/FactoryUtils';

import { dbConnection, disconnectDB } from './data/TestingDBConnection';

beforeAll(async () => {
  await dbConnection();
  await PublicationRepo.addPublicationsToDB();
  await MagazineModel.createCollection;
});

beforeEach(async () => {
  await MagazineModel.deleteMany({});
});

afterAll(async () => {
  MagazineModel.deleteMany({}).then(disconnectDB);
});

describe('getAllMagazine tests:', () => {
  test('getAllMagazines - No Magazines', async () => {
    const getMagazineResponses = await MagazineRepo.getAllMagazines();
    expect(getMagazineResponses).toHaveLength(0);
  });
  test('getAllMagazines - 5 Magazines', async () => {
    const magazines = await MagazineFactory.create(5);
    await MagazineModel.insertMany(magazines);

    const getMagazinesResponse = await MagazineRepo.getAllMagazines();
    expect(getMagazinesResponse).toHaveLength(5);
  });
  test('getAllMagazines limit 2', async () => {
    const magazines = await MagazineFactory.create(3);
    await MagazineModel.insertMany(magazines);

    const getMagazinesResponse = await MagazineRepo.getAllMagazines(0, 2);
    expect(getMagazinesResponse).toHaveLength(2);
  });
  test('getAllMagazines - Sort by date desc, offset 2, limit 2', async () => {
    const magazines = await MagazineFactory.create(5);
    magazines.sort(FactoryUtils.compareByDate);
    await MagazineModel.insertMany(magazines);

    const magazineTitles = FactoryUtils.mapToValue(magazines.slice(2, 4), 'title'); // offset=2, limit=2

    const getMagazinesResponse = await MagazineRepo.getAllMagazines(2, 2);
    const respTitles = FactoryUtils.mapToValue(getMagazinesResponse, 'title');

    expect(respTitles).toEqual(magazineTitles);
  });
});

describe('getMagazine(s)ByID(s) tests:', () => {
  test('getMagazineByID - 1 Magazine', async () => {
    const Magazines = await MagazineFactory.create(1);
    const insertOutput = await MagazineModel.insertMany(Magazines);
    const id = insertOutput[0]._id;

    const getMagazinesResponse = await MagazineRepo.getMagazineByID(id);
    expect(getMagazinesResponse.title).toEqual(Magazines[0].title);
  });
  test('getMagazinesByIDs - 3 Magazines', async () => {
    const Magazines = await MagazineFactory.create(3);
    const insertOutput = await MagazineModel.insertMany(Magazines);
    const ids = FactoryUtils.mapToValue(insertOutput, '_id');
    const getMagazinesResponse = await MagazineRepo.getMagazinesByIDs(ids);

    expect(FactoryUtils.mapToValue(getMagazinesResponse, 'title')).toEqual(
      FactoryUtils.mapToValue(Magazines, 'title'),
    );
  });
});

describe('getMagazinesByPublicationSlug(s) tests', () => {
  test('getMagazinesByPublicationSlug - 1 publication, 1 Magazine', async () => {
    const pub = await PublicationFactory.getRandomPublication();
    const Magazines = await MagazineFactory.createSpecific(1, {
      publicationSlug: pub.slug,
      publication: pub,
    });
    await MagazineModel.insertMany(Magazines);

    const getMagazinesResponse = await MagazineRepo.getMagazinesByPublicationSlug(pub.slug);
    expect(getMagazinesResponse[0].title).toEqual(Magazines[0].title);
  });

  test('getMagazinesByPublicationSlug - 1 publication, 3 Magazines', async () => {
    const pub = await PublicationFactory.getRandomPublication();
    const Magazines = (
      await MagazineFactory.createSpecific(3, {
        publicationSlug: pub.slug,
        publication: pub,
      })
    ).sort(FactoryUtils.compareByDate);

    await MagazineModel.insertMany(Magazines);
    const getMagazinesResponse = await MagazineRepo.getMagazinesByPublicationSlug(pub.slug);

    expect(FactoryUtils.mapToValue(getMagazinesResponse, 'title')).toEqual(
      FactoryUtils.mapToValue(Magazines, 'title'),
    );
  });

  test('getMagazinesByPublicationSlugs - many publications, 5 Magazines', async () => {
    const Magazines = (await MagazineFactory.create(3)).sort(FactoryUtils.compareByDate);

    await MagazineModel.insertMany(Magazines);
    const getMagazinesResponse = await MagazineRepo.getMagazinesByPublicationSlug(
      FactoryUtils.mapToValue(Magazines, 'publicationSlug'),
    );

    expect(FactoryUtils.mapToValue(getMagazinesResponse, 'title')).toEqual(
      FactoryUtils.mapToValue(Magazines, 'title'),
    );
  });
});

describe('getMagazinesBySemester test', () => {
  test('getMagazinesBySemester, Semester - random semester, 3 articles', async () => {
    const sem = _.sample(['FA22', 'SP23']);
    const magazines = (
      await MagazineFactory.createSpecific(3, {
        semester: sem,
      })
    ).sort(FactoryUtils.compareByDate);

    await MagazineModel.insertMany(magazines);
    const getMagazinesResponse = await MagazineRepo.getMagazinesBySemester(sem);

    expect(FactoryUtils.mapToValue(getMagazinesResponse, 'title')).toEqual(
      FactoryUtils.mapToValue(magazines, 'title'),
    );
  });
});

describe('getFeaturedMagazines test', () => {
  test('getFeaturedMagazines, featured = true, 3 articles', async () => {
    const magazines = (
      await MagazineFactory.createSpecific(3, {
        isFeatured: true,
      })
    ).sort(FactoryUtils.compareByDate);

    await MagazineModel.insertMany(magazines);
    const getMagazinesResponse = await MagazineRepo.getFeaturedMagazines(3);

    expect(FactoryUtils.mapToValue(getMagazinesResponse, 'title')).toEqual(
      FactoryUtils.mapToValue(magazines, 'title'),
    );
  });
});

describe('incrementShoutouts tests', () => {
  test('incrementShoutouts - Shoutout 1 Magazine', async () => {
    const Magazines = await MagazineFactory.create(1);
    const oldShoutouts = Magazines[0].shoutouts;
    const insertOutput = await MagazineModel.insertMany(Magazines);

    await MagazineRepo.incrementShoutouts(insertOutput[0]._id);

    const getMagazinesResponse = await MagazineRepo.getMagazineByID(insertOutput[0]._id);
    expect(getMagazinesResponse.shoutouts).toEqual(oldShoutouts + 1);
  });
});

// need : featured magazine tests
