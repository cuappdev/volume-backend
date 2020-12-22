import { ObjectId } from 'mongodb';
import { Publication, PublicationModel } from '../entities/Publication';

import publicationsJSON from '../../publications.json';

function getImageURLs(slug: string): [string, string] {
  return [
    `${process.env.IMAGE_ADDRESS}/${slug}/background.png`,
    `${process.env.IMAGE_ADDRESS}/${slug}/profile.png`,
  ];
}

/**
 * Reads publication info from static JSON and stores info in database.
 * @function
 * @returns {Publication []} An array of Publication objects.
 */
const addPublicationsToDB = async (): Promise<void> => {
  const publicationsDB = publicationsJSON.publications;

  const publications = [];
  for (const publication of publicationsDB) {
    const { bio, bioShort, rssName, rssURL, name, slug, websiteURL } = publication;
    const [backgroundImageURL, profileImageURL] = getImageURLs(slug);
    publications.push(
      Object.assign(new Publication(), {
        _id: new ObjectId().toString(),
        backgroundImageURL,
        bio,
        bioShort,
        name,
        profileImageURL,
        rssName,
        rssURL,
        slug,
        websiteURL,
      }),
    );
  }

  try {
    // Attempt to insert publications while validating a duplicate isn't inserted
    await PublicationModel.insertMany(publications, { ordered: false });
  } catch (e) {
    if (e.insertedDocs) {
      console.log('Publications were refreshed');
    } else {
      console.log(e);
    }
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
