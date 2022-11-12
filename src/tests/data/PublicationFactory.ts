/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { Publication, PublicationModel } from '../../entities/Publication';

class PublicationFactory {
  public static async getRandomPublication(noExtras = false): Promise<Publication> {
    const pub = (await PublicationModel.aggregate().sample(1))[0];
    if (noExtras) {
      delete pub._id;
      delete pub.__v;
    }
    return pub;
  }

  public static async getAllPublications(noExtras = false): Promise<Publication[]> {
    const pubs = await PublicationModel.find({});
    if (noExtras) {
      pubs.forEach((pub) => {
        delete pub._id;
        delete pub.__v;
      });
    }
    return pubs;
  }
}

export default PublicationFactory;
