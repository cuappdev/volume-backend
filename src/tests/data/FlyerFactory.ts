/* eslint-disable no-underscore-dangle */
import { faker } from '@faker-js/faker';
import { _ } from 'underscore';
import OrganizationFactory from './OrganizationFactory';
import { Flyer } from '../../entities/Flyer';
import FactoryUtils from './FactoryUtils';

class FlyerFactory {
  public static async create(n: number): Promise<Flyer[]> {
    /**
     * Returns a list of n number of random Flyer objects
     *
     * @param n The number of desired random Flyer objects
     * @returns A Promise of the list of n number of random Flyer objects
     */
    return Promise.all(FactoryUtils.create(n, FlyerFactory.fake));
  }

  public static async createSpecific(
    n: number,
    newMappings: { [key: string]: any },
  ): Promise<Flyer[]> {
    /**
     * Returns a list of n number of random Flyer objects with specified
     * fields values in newMappings
     *
     * @param n The number of desired random Flyer objects
     * @param newMappings The specified values for Flyer parameters [key]
     * @returns A Promise of the list of n number of random Flyer objects
     */
    const arr = await FlyerFactory.create(n);
    return arr.map((x) => {
      const newDoc = x;
      Object.entries(newMappings).forEach(([k, v]) => {
        newDoc[k] = v;
      });
      return newDoc;
    });
  }

  public static async fake(): Promise<Flyer> {
    /**
     * Returns a Flyer with random values in its instance variables
     *
     * @returns The Flyer object with random values in its instance variables
     */
    const fakeFlyer = new Flyer();
    const exampleOrg = await OrganizationFactory.getRandomOrganization();

    fakeFlyer.categorySlug = faker.commerce.productDescription();
    fakeFlyer.endDate = faker.date.future();
    fakeFlyer.flyerURL = faker.datatype.string();
    fakeFlyer.imageURL = faker.image.cats();
    fakeFlyer.isTrending = _.sample([true, false]);
    fakeFlyer.location = faker.datatype.string();
    fakeFlyer.organization = exampleOrg;
    fakeFlyer.organizationSlug = exampleOrg.slug;
    fakeFlyer.startDate = faker.date.past();
    fakeFlyer.timesClicked = _.random(0, 50);
    fakeFlyer.title = faker.commerce.productDescription();
    fakeFlyer.trendiness = 0;

    return fakeFlyer;
  }
}
export default FlyerFactory;
