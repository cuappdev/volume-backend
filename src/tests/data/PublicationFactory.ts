/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { Publication, PublicationModel } from '../../entities/Publication';

class PublicationFactory {
  public static async getRandomPublication(): Promise<Publication> {
    return (await PublicationModel.aggregate().sample(1))[0];
  }

  public static async getAllPublications(): Promise<Publication[]> {
    return PublicationModel.find({});
  }
}

export default PublicationFactory;
