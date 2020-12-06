import { ObjectId } from 'mongodb';
import { Publication, PublicationModel } from '../entities/Publication';

import publicationsJSON from '../../publications.json';

/**
 * Reads publication info from static JSON and stores info in database.
 * @function
 * @returns {Publication []} An array of Publication objects.
 */
const addPublicationsToDB = async (): Promise<void> => {
  const publicationsDB = publicationsJSON.publications;

  const publications = [];
  for (const publication of publicationsDB) {
    const { bio, rssURL, imageURL, name, websiteURL, rssName } = publication;
    publications.push(
      Object.assign(new Publication(), {
        _id: new ObjectId().toString(),
        bio,
        rssURL,
        imageURL,
        name,
        websiteURL,
        rssName,
      }),
    );
  }

  try {
    // Attempt to insert publications while validating a duplicate isn't inserted
    await PublicationModel.insertMany(publications, { ordered: false });
  } finally {
    console.log('Publications were refreshed.');
  }
};

const getPublicationByID = async (id: string): Promise<Publication> => {
  return PublicationModel.findById(new ObjectId(id));
};

const getAllPublications = async (): Promise<Publication[]> => {
  return PublicationModel.find({});
};

export default {
  addPublicationsToDB,
  getPublicationByID,
  getAllPublications,
};
