import Filter from 'bad-words';
import { ObjectId } from 'mongodb';

import { Flyer, FlyerModel } from '../entities/Flyer';
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  FILTERED_WORDS,
  MAX_NUM_DAYS_OF_TRENDING_ARTICLES,
  MAX_NUM_OF_TRENDING_FLYERS,
} from '../common/constants';
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
    .sort({ startDate: 'desc' })
    .skip(offset)
    .limit(limit)
    .then((flyers) => {
      return flyers.filter((flyer) => !isFlyerFiltered(flyer));
    });
};

const getFlyersAfterDate = (since: string, limit = DEFAULT_LIMIT): Promise<Flyer[]> => {
  return (
    FlyerModel.find({
      // Get all Flyers after or on the desired date
      endDate: { $gte: new Date(since) },
    })
      // Sort dates in order of most recent to least
      .sort({ endDate: 'desc' })
      .limit(limit)
      .then((flyers) => {
        return flyers.filter((flyer) => flyer !== null && !isFlyerFiltered(flyer));
      })
  );
};

const getFlyersBeforeDate = (before: string, limit = DEFAULT_LIMIT): Promise<Flyer[]> => {
  return (
    FlyerModel.find({
      // Get all Flyers before the desired date
      endDate: { $lt: new Date(before) },
    })
      // Sort dates in order of most recent to least
      .sort({ endDate: 'desc' })
      .limit(limit)
      .then((flyers) => {
        return flyers.filter((flyer) => flyer !== null && !isFlyerFiltered(flyer));
      })
  );
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
    .sort({ startDate: 'desc' })
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
    .sort({ startDate: 'desc' })
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
  return FlyerModel.find({ organizationSlugs: organization.slug })
    .sort({ startDate: 'desc' })
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

/**
 * Performs a text search on all Flyers to find Flyers with indexed fields
 * matching the query
 * @see https://www.mongodb.com/docs/manual/text-search/#text-search-on-self-managed-deployments
 * @param query the term to search for
 * @param limit the number of results to return
 * @returns at most limit Flyers with indexed fields matching the query
 */
const searchFlyers = async (query: string, limit = DEFAULT_LIMIT) => {
  const flyers = await FlyerModel.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  )
    // Sort Flyers by most relevant
    .sort({
      score: { $meta: "textScore" }
    })
    // Filter out past Flyers
    .find({
      endDate: { $gt: new Date() }
    })
  const limitedFlyers = flyers.slice(0, limit);
  return limitedFlyers
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
  const flyers = await (
    await FlyerModel.aggregate()
      // sort flyers by trendiness
      .sort({ trendiness: 'desc' })
      // Only get flyers for events that start in the next few days
      .match({
        startDate: {
          $lte: new Date(
            new Date().setDate(new Date().getDate() + MAX_NUM_DAYS_OF_TRENDING_ARTICLES),
          ),
        },
      })
  ).slice(0, MAX_NUM_OF_TRENDING_FLYERS);

  flyers.forEach(async (a) => {
    const flyer = await FlyerModel.findById(new ObjectId(a._id)); // eslint-disable-line
    flyer.isTrending = true;
    await flyer.save();
  });

  return flyers;
};

/**
 * Increments number of times clicked on a flyer by one.
 * @function
 * @param {string} id - string representing the unique Object Id of a flyer.
 */
const incrementTimesClicked = async (id: string): Promise<Flyer> => {
  const flyer = await FlyerModel.findById(new ObjectId(id));
  if (flyer) {
    flyer.timesClicked += 1;
    // update the trendiness of a flyer
    flyer.trendiness =
      (flyer.timesClicked / (flyer.startDate.getTime() - new Date().getTime())) * 10000000;
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
  getFlyersBeforeDate,
  getFlyersByIDs,
  getFlyersByOrganizationID,
  getFlyersByOrganizationIDs,
  getFlyersByOrganizationSlug,
  getFlyersByOrganizationSlugs,
  getTrendingFlyers,
  incrementTimesClicked,
  refreshTrendingFlyers,
  searchFlyers,
};
