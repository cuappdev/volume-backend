import Filter from 'bad-words';
import { ObjectId } from 'mongodb';

import { Flyer, FlyerModel } from '../entities/Flyer';
import { DEFAULT_LIMIT, DEFAULT_OFFSET, FILTERED_WORDS } from '../common/constants';
import { OrganizationModel } from '../entities/Organization';
import utils from '../utils';

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

const getFlyersByCategorySlug = async (
  categorySlug: string,
  limit = DEFAULT_LIMIT,
  offset = DEFAULT_OFFSET,
): Promise<Flyer[]> => {
  return FlyerModel.find({ categorySlug })
    .sort({ startDate: 'desc' })
    .skip(offset)
    .limit(limit)
    .then((flyers) => {
      return flyers.filter((flyer) => flyer !== null && !isFlyerFiltered(flyer));
    });
};

/**
 * Looks for unique category slugs for all the Flyers
 *
 * @returns a list of Strings with all the category names.
 */
const getAllFlyerCategories = (): Promise<string[]> => {
  return FlyerModel.collection.distinct('categorySlug');
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
    { score: { $meta: 'textScore' } },
  )
    // Sort Flyers by most relevant
    .sort({
      score: { $meta: 'textScore' },
    })
    // Filter out past Flyers
    .find({
      endDate: { $gt: new Date() },
    });
  return flyers.slice(0, limit);
};

/**
 * Computes and returns the trending Flyers in the database.
 *
 * @function
 * @param {number} limit - number of Flyers to retrieve.
 */
const getTrendingFlyers = async (limit: number = DEFAULT_LIMIT): Promise<Flyer[]> =>
  FlyerModel.find({
    // Filter by Flyers in the future
    endDate: { $gte: new Date() },
  })
    // Simply select Flyers with the most trendiness
    .sort({
      trendiness: 'desc',
    })
    .limit(limit);

/**
 * Increments number of times clicked on a flyer by one.
 *
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
 * Create a new flyer.
 *
 * @param {string} categorySlug the slug for this flyer's category
 * @param {string} endDate the end date for this flyer's event in UTC ISO8601 format
 * @param {string} flyerURL the URL for this flyer when tapped
 * @param {string} imageURL the URL representing this flyer's image
 * @param {string} location the location for this flyer's event
 * @param {string} organizationID the ID of the organization creating this flyer
 * @param {string} startDate the start date for this flyer's event in UTC ISO8601 format
 * @param {string} title the title for this flyer
 * @returns the newly created Flyer
 */
const createFlyer = async (
  categorySlug: string,
  endDate: string,
  flyerURL: string,
  imageURL: string,
  location: string,
  organizationID: string,
  startDate: string,
  title: string,
): Promise<Flyer> => {
  // Fetch organization given organization ID
  // This call will fail if the organization cannot be found
  const organization = await OrganizationModel.findById(new ObjectId(organizationID));
  const organizationSlug = organization.slug;

  const newFlyer = Object.assign(new Flyer(), {
    categorySlug,
    endDate,
    flyerURL,
    imageURL,
    location,
    organization,
    organizationSlug,
    startDate,
    title,
  });

  return FlyerModel.create(newFlyer);
};

/**
 * Delete a flyer
 *
 * @param id the flyer ID to remove
 */
const deleteFlyer = async (id: string): Promise<Flyer> => {
  const flyerToRemove = await FlyerModel.findById(new ObjectId(id));
  if (!flyerToRemove) {
    return null;
  }
  // Remove image from our servers
  await utils.removeImage(flyerToRemove.imageURL);
  const flyer = await FlyerModel.findByIdAndDelete(new ObjectId(id));
  return flyer;
};

/**
 * Edit an existing flyer.
 *
 * @param {string} id the ID of the flyer to edit
 * @param {string} categorySlug the slug for this flyer's category
 * @param {string} endDate the end date for this flyer's event in UTC ISO8601 format
 * @param {string} flyerURL the URL for this flyer when tapped
 * @param {string} imageURL the URL representing this flyer's image
 * @param {string} location the location for this flyer's event
 * @param {string} startDate the start date for this flyer's event in UTC ISO8601 format
 * @param {string} title the title for this flyer
 * @returns the edited Flyer
 */
const editFlyer = async (
  id: string,
  categorySlug: string = null,
  endDate: string = null,
  flyerURL: string = null,
  imageURL: string = null,
  location: string = null,
  startDate: string = null,
  title: string = null,
): Promise<Flyer> => {
  // Fetch flyer given flyer ID
  const flyer = await FlyerModel.findById(new ObjectId(id));

  if (flyer) {
    // Remove existing image from our servers (if not null)
    if (imageURL) await utils.removeImage(flyer.imageURL);

    // Update flyer fields (if not nul)
    if (categorySlug) flyer.categorySlug = categorySlug;
    if (endDate) flyer.endDate = new Date(endDate);
    if (flyerURL) flyer.flyerURL = flyerURL;
    if (imageURL) flyer.imageURL = imageURL;
    if (location) flyer.location = location;
    if (startDate) flyer.startDate = new Date(startDate);
    if (title) flyer.title = title;

    return flyer.save();
  }

  // Flyer not found
  return flyer;
};

export default {
  createFlyer,
  deleteFlyer,
  editFlyer,
  getAllFlyers,
  getAllFlyerCategories,
  getFlyerByID,
  getFlyersAfterDate,
  getFlyersBeforeDate,
  getFlyersByCategorySlug,
  getFlyersByIDs,
  getFlyersByOrganizationID,
  getFlyersByOrganizationIDs,
  getFlyersByOrganizationSlug,
  getFlyersByOrganizationSlugs,
  getTrendingFlyers,
  incrementTimesClicked,
  searchFlyers,
};
