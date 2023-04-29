/* eslint-disable no-underscore-dangle */
import { faker } from '@faker-js/faker';
import { _ } from 'underscore';
import PublicationFactory from './PublicationFactory';
import { Magazine } from '../../entities/Magazine';
import FactoryUtils from './FactoryUtils';

class MagazineFactory {
  public static async create(n: number): Promise<Magazine[]> {
    /**
     * Returns a list of n number of random Magazine objects
     */
    return Promise.all(FactoryUtils.create(n, MagazineFactory.fake));
  }

  public static async createSpecific(
    n: number,
    newMappings: { [key: string]: any },
  ): Promise<Magazine[]> {
    /**
     * Returns a list of n number of random Magazine objects with specified
     * field values in new Mappings
     */
    const arr = await MagazineFactory.create(n);
    return arr.map((x) => {
      const newDoc = x;
      Object.entries(newMappings).forEach(([k, v]) => {
        newDoc[k] = v;
      });
      return newDoc;
    });
  }

  public static async fake(): Promise<Magazine> {
    /**
     * Returns a Magazine with random values in its instance variables
     */
    const fakeMagazine = new Magazine();
    const examplePublication = await PublicationFactory.getRandomPublication();

    fakeMagazine.date = faker.date.past();
    fakeMagazine.semester = _.sample(['FA22', 'SP23']);
    fakeMagazine.pdfURL = faker.image.cats();
    fakeMagazine.publication = examplePublication;
    fakeMagazine.publicationSlug = examplePublication.slug;
    fakeMagazine.shoutouts = _.random(0, 50);
    fakeMagazine.title = faker.commerce.productDescription();
    fakeMagazine.nsfw = _.sample([true, false]);
    fakeMagazine.isFeatured = _.sample([true, false]);
    fakeMagazine.trendiness = 0;
    fakeMagazine.isFiltered = _.sample([true, false]);

    return fakeMagazine;
  }
}
export default MagazineFactory;
