/* eslint-disable no-underscore-dangle */
import { faker } from '@faker-js/faker';
import { _ } from 'underscore';
import { User } from '../../entities/User';
import FactoryUtils from './FactoryUtils';

class UserFactory {
  public static async create(n: number): Promise<User[]> {
    /**
     * Returns a list of n number of random User objects
     *
     * @param n The number of desired random User objects
     * @returns A Promise of the list of n number of random User objects
     */
    return Promise.all(FactoryUtils.create(n, UserFactory.fake));
  }

  public static async createSpecific(
    n: number,
    newMappings: { [key: string]: any },
  ): Promise<User[]> {
    /**
     * Returns a list of n number of random User objects with specified
     * fields values in newMappings
     *
     * @param n The number of desired random User objects
     * @param newMappings The specified values for User parameters [key]
     * @returns A Promise of the list of n number of random User objects
     */
    const arr = await UserFactory.create(n);
    return arr.map((x) => {
      const newDoc = x;
      Object.entries(newMappings).forEach(([k, v]) => {
        newDoc[k] = v;
      });
      return newDoc;
    });
  }

  public static async fake(): Promise<User> {
    /**
     * Returns a User with random values in its instance variables
     *
     * @returns The User object with random values in its instance variables
     */
    const fakeUser = new User();

    fakeUser.deviceToken = faker.datatype.string();
    fakeUser.deviceType = _.sample(['IOS', 'ANDROID']);
    fakeUser.uuid = faker.datatype.uuid();

    return fakeUser;
  }
}
export default UserFactory;
