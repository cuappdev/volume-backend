import Filter from 'bad-words';
import Fuse from 'fuse.js';

import { ObjectId } from 'mongodb';
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  FILTERED_WORDS,
  MAX_NUM_DAYS_OF_TRENDING_ARTICLES,
} from '../common/constants';
import { Flyer, FlyerModel } from '../entities/Flyer';
import { OrganizationModel } from '../entities/Organization';

const { IS_FILTER_ACTIVE } = process.env;

function isFlyerFiltered(flyer: Flyer) {
  if (IS_FILTER_ACTIVE === 'true') {
    const filter = new Filter({ list: FILTERED_WORDS });
    return filter.isProfane(flyer.title);
  }
  return false;
}

const getAllFlyers = async (offset = DEFAULT_OFFSET, limit = DEFAULT_LIMIT): Promise<Flyer[]> => {
  return FlyerModel.find({})
    .sort({ date: 'desc' })
    .skip(offset)
    .limit(limit)
    .then((flyers) => {
      return flyers.filter((flyer) => !isFlyerFiltered(flyer));
    });
};

const getFlyerByID = async (id: string): Promise<Flyer> => {
  return FlyerModel.findById(new ObjectId(id)).then((flyer) => {
    if (!isFlyerFiltered(flyer)) {
      return flyer;
    }
    return null;
  });
};

const getFlyersByIDs = async (ids: string[]): Promise<Flyer[]> => {
  return Promise.all(ids.map((id) => FlyerModel.findById(new ObjectId(id)))).then((flyers) => {
    // Filter out all null values that were returned by ObjectIds not associated
    // with flyers in database
    return flyers.filter((flyer) => flyer !== null && !isFlyerFiltered(flyer));
  });
};

const getFlyersByOrganizationSlug = async (
  slug: string,
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET,
): Promise<Flyer[]> => {
  return FlyerModel.find({ 'organization.slug': slug })
    .sort({ date: 'desc' })
    .skip(offset)
    .limit(limit)
    .then((flyers) => {
      return flyers.filter((flyer) => flyer !== null && !isFlyerFiltered(flyer));
    });
};

const getFlyersByOrganizationSlugs = async (
  slugs: string[],
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET,
): Promise<Flyer[]> => {
  const uniqueSlugs = [...new Set(slugs)];
  return FlyerModel.find({ 'organization.slug': { $in: uniqueSlugs } })
    .sort({ date: 'desc' })
    .skip(offset)
    .limit(limit)
    .then((flyers) => {
      return flyers.filter((flyer) => flyer !== null && !isFlyerFiltered(flyer));
    });
};

const getFlyersByOrganizationID = async (
  organizationID: string,
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET,
): Promise<Flyer[]> => {
  const organization = await (await OrganizationModel.findById(organizationID)).execPopulate();
  return FlyerModel.find({ 'organization.slug': organization.slug })
    .sort({ date: 'desc' })
    .skip(offset)
    .limit(limit)
    .then((flyers) => {
      return flyers.filter((flyer) => flyer !== null && !isFlyerFiltered(flyer));
    });
};

const getFlyersByOrganizationIDs = async (
  organizationIDs: string[],
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET,
): Promise<Flyer[]> => {
  const uniqueOrgIDs = [...new Set(organizationIDs)].map((id) => new ObjectId(id));
  const orgSlugs = await OrganizationModel.find({ _id: { $in: uniqueOrgIDs } }).select('slug');
  return getFlyersByOrganizationSlugs(
    orgSlugs.map((org) => org.slug),
    limit,
    offset,
  );
};

const getFlyersAfterDate = async (since: string, limit = DEFAULT_LIMIT): Promise<Flyer[]> => {
  return (
    FlyerModel.find({
      // Get all Flyers after or on the desired date
      date: { $gte: new Date(new Date(since).setHours(0, 0, 0)) },
    })
      // Sort dates in order of most recent to least
      .sort({ date: 'desc' })
      .limit(limit)
      .then((flyers) => {
        return flyers.filter((flyer) => flyer !== null && !isFlyerFiltered(flyer));
      })
  );
};

/**
 * Performs fuzzy search on all Flyers to find Flyers with title/publisher matching the query.
 * @param query the term to search for
 * @param limit the number of results to return
 * @returns at most limit Flyers with titles or publishers matching the query
 */
const searchFlyers = async (query: string, limit = DEFAULT_LIMIT) => {
  const allFlyers = await FlyerModel.find({});
  const searcher = new Fuse(allFlyers, {
    keys: ['title', 'organization.name'],
  });

  return searcher
    .search(query)
    .map((searchRes) => searchRes.item)
    .slice(0, limit);
};

/**
 * Computes and returns the trending Flyers in the database.
 *
 * @function
 * @param {number} limit - number of Flyers to retrieve.
 */
const getTrendingFlyers = async (limit = DEFAULT_LIMIT): Promise<Flyer[]> => {
  const flyers = await FlyerModel.find({ isTrending: true }).exec();
  return flyers.filter((flyer) => !isFlyerFiltered(flyer)).slice(0, limit);
};

/**
 * Refreshes trending Flyers.
 */
const refreshTrendingFlyers = async (): Promise<Flyer[]> => {
  // Set previous trending Flyers to not trending
  const oldTrendingFlyers = await FlyerModel.find({ isTrending: true }).exec();
  oldTrendingFlyers.forEach(async (a) => {
    const flyer = await FlyerModel.findById(new ObjectId(a._id)); // eslint-disable-line
    flyer.isTrending = false;
    await flyer.save();
  });

  // Get new trending Flyers
  const flyers = await FlyerModel.aggregate()
    // Get a sample of random Flyers
    .sample(100)
    // Get Flyers after 30 days ago
    .match({
      date: {
        $gte: new Date(
          new Date().setDate(new Date().getDate() - MAX_NUM_DAYS_OF_TRENDING_ARTICLES),
        ),
      },
    });

  flyers.forEach(async (a) => {
    const flyer = await FlyerModel.findById(new ObjectId(a._id)); // eslint-disable-line
    flyer.isTrending = true;
    await flyer.save();
  });

  return flyers;
};

/**
 * Increments number of shoutouts on an Flyer and publication by one.
 * @function
 * @param {string} id - string representing the unique Object Id of an Flyer.
 */
const incrementShoutouts = async (id: string): Promise<Flyer> => {
  const flyer = await FlyerModel.findById(new ObjectId(id));
  if (flyer) {
    flyer.shoutouts += 1;
    return flyer.save();
  }
  return flyer;
};

/**
 * Checks if an Flyer's title contains profanity.
 * @function
 * @param {string} title - Flyer title.
 */
const checkProfanity = async (title: string): Promise<boolean> => {
  const filter = new Filter();
  return filter.isProfane(title);
};

export default {
  checkProfanity,
  getAllFlyers,
  getFlyerByID,
  getFlyersAfterDate,
  getFlyersByIDs,
  getFlyersByOrganizationID,
  getFlyersByOrganizationIDs,
  getFlyersByOrganizationSlug,
  getFlyersByOrganizationSlugs,
  getTrendingFlyers,
  incrementShoutouts,
  refreshTrendingFlyers,
  searchFlyers,
};
