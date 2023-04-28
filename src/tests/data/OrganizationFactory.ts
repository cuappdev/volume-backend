/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { Organization, OrganizationModel } from '../../entities/Organization';

class OrganizationFactory {
  /**
   * Gets a random Organization
   * @returns A Promise for a Organization object
   */
  public static async getRandomOrganization(): Promise<Organization> {
    return (await OrganizationModel.aggregate().sample(1))[0];
  }

  /**
   * Gets all Organizations
   * @returns A Promise for a list of Organization objects
   */
  public static async getAllOrganizations(): Promise<Organization[]> {
    return OrganizationModel.find({});
  }
}

export default OrganizationFactory;
