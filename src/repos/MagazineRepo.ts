/* eslint-disable no-underscore-dangle */
import Filter from 'bad-words';
import { ObjectId } from 'mongodb';
import { Magazine, MagazineModel } from '../entities/Magazine';
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  FILTERED_WORDS,
  MAX_NUM_DAYS_OF_FEATURED_MAGAZINES,
} from '../common/constants';

const { IS_FILTER_ACTIVE } = process.env;

function isMagazineFiltered(magazine: Magazine) {
  if (IS_FILTER_ACTIVE === 'true') {
    if (magazine.isFiltered) {
      // If the body has been checked already in microservice
      return true;
    }
    const filter = new Filter({ list: FILTERED_WORDS });
    return filter.isProfane(magazine.title);
  }
  return false;
}

const getAllMagazines = async (
  offset = DEFAULT_OFFSET,
  limit = DEFAULT_LIMIT,
): Promise<Magazine[]> => {
  return MagazineModel.find({})
    .sort({ date: 'desc' })
    .skip(offset)
    .limit(limit)
    .then((magazines) => {
      return magazines.filter((magazine) => !isMagazineFiltered(magazine));
    });
};

function getMagazinesBySemester(
  semester: string,
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET,
) {
  return MagazineModel.find({ semester })
    .sort({ date: 'desc' })
    .skip(offset)
    .limit(limit)
    .then((magazines) => {
      return magazines.filter((magazine) => magazine !== null && !isMagazineFiltered(magazine));
    });
}

function getMagazinesByPublicationSlug(
  slug: string,
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET,
) {
  return MagazineModel.find({ publicationSlug: slug })
    .sort({ date: 'desc' })
    .skip(offset)
    .limit(limit)
    .then((magazines) => {
      return magazines.filter((magazine) => magazine !== null && !isMagazineFiltered(magazine));
    });
}

const getMagazinesByPublicationSlugs = async (
  slugs: string[],
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET,
): Promise<Magazine[]> => {
  const uniqueSlugs = [...new Set(slugs)];
  return MagazineModel.find({ 'publication.slug': { $in: uniqueSlugs } })
    .sort({ date: 'desc' })
    .skip(offset)
    .limit(limit)
    .then((magazines) => {
      return magazines.filter((magazine) => magazine !== null && !isMagazineFiltered(magazine));
    });
};

const getMagazineByID = async (id: string): Promise<Magazine> => {
  return MagazineModel.findById(new ObjectId(id)).then((magazine) => {
    if (!isMagazineFiltered(magazine)) {
      return magazine;
    }
    return null;
  });
};

function getMagazinesByIDs(ids: string[]) {
  return Promise.all(ids.map((id) => MagazineModel.findById(new ObjectId(id)))).then(
    (magazines) => {
      return magazines.filter((magazine) => magazine !== null && !isMagazineFiltered(magazine));
    },
  );
}

/**
 * Computes and returns the featured magazines in the database.
 *
 * @function
 * @param {number} limit - number of magazines to retrieve.
 */
const getFeaturedMagazines = async (limit = DEFAULT_LIMIT): Promise<Magazine[]> => {
  const magazines = await MagazineModel.find({ isFeatured: true }).exec();
  return magazines.filter((magazine) => !isMagazineFiltered(magazine)).slice(0, limit);
};

/**
 * Refreshes featured magazines.
 */
const refreshFeaturedMagazines = async (): Promise<Magazine[]> => {
  // Set previous featured magazines to not featured
  const oldFeaturedMagazines = await MagazineModel.find({ isFeatured: true }).exec();
  oldFeaturedMagazines.forEach(async (m) => {
    const magazine = await MagazineModel.findById(new ObjectId(m._id));
    magazine.isFeatured = false;
    await magazine.save();
  });

  // Get new featured magazines
  const magazines = await MagazineModel.aggregate()
    // Get a sample of random magazines
    .sample(100)
    // Get magazines after 30 days ago
    .match({
      date: {
        $gte: new Date(
          new Date().setDate(new Date().getDate() - MAX_NUM_DAYS_OF_FEATURED_MAGAZINES),
        ),
      },
    });

  magazines.forEach(async (m) => {
    const magazine = await MagazineModel.findById(new ObjectId(m._id));
    magazine.isFeatured = true;
    await magazine.save();
  });

  return magazines;
};

/**
 * Increments number of shoutouts on an magazine and publication by one.
 * @function
 * @param {string} id - string representing the unique Object Id of a magazine.
 */
const incrementShoutouts = async (id: string): Promise<Magazine> => {
  const magazine = await MagazineModel.findById(new ObjectId(id));
  if (magazine) {
    magazine.shoutouts += 1;
    return magazine.save();
  }
  return magazine;
};

/**
 * Checks if an magazine's title contains profanity.
 * @function
 * @param {string} title - magazine title.
 */
const checkProfanity = async (title: string): Promise<boolean> => {
  const filter = new Filter();
  return filter.isProfane(title);
};

/**
 * Performs a text search on all Magazines to find Magazines with indexed fields
 * matching the query
 * @see https://www.mongodb.com/docs/manual/text-search/#text-search-on-self-managed-deployments
 * @param query the term to search for
 * @param limit the number of results to return
 * @returns at most limit Magazines with indexed fields matching the query
 */
const searchMagazines = async (query: string, limit = DEFAULT_LIMIT) => {
  const magazines = await MagazineModel.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } },
  ).sort({ score: { $meta: 'textScore' } });
  return magazines.slice(0, limit);
};

export default {
  getAllMagazines,
  getMagazinesBySemester,
  getMagazinesByPublicationSlug,
  getMagazinesByPublicationSlugs,
  getMagazineByID,
  getMagazinesByIDs,
  getFeaturedMagazines,
  checkProfanity,
  incrementShoutouts,
  refreshFeaturedMagazines,
  searchMagazines,
};
