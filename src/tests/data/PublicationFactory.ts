/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { Publication, PublicationModel } from '../../entities/Publication';

class PublicationFactory {
  /**
   * Gets a random Publication
   * @returns A Promise for a Publication object
   */
  public static async getRandomPublication(): Promise<Publication> {
    return (await PublicationModel.aggregate().sample(1))[0];
  }

  /**
   * Gets all Publications
   * @returns A Promise for a list of Publication objects
   */
  public static async getAllPublications(): Promise<Publication[]> {
    return PublicationModel.find({});
  }
}

export default PublicationFactory;
