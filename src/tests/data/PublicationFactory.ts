/* eslint-disable no-underscore-dangle */
import { ObjectId } from 'mongodb';
import { PublicationModel } from '../../entities/Publication';

class PublicationFactory {
  public static async getRandomPublication() {
    const pubs = await PublicationModel.aggregate().sample(1);
    const pub = await PublicationModel.findById(new ObjectId(pubs[0]._id));
    return pub;
  }
}

export default PublicationFactory;
