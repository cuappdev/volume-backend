/* eslint-disable no-underscore-dangle */
import { PublicationModel } from '../../entities/Publication';

class PublicationFactory {
  public static async getRandomPublication() {
    return (await PublicationModel.aggregate().sample(1))[0];
  }
}

export default PublicationFactory;
