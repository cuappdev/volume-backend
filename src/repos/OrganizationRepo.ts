import { ObjectId } from 'mongodb';
import { compare } from 'bcrypt';
import { UnauthorizedError } from 'type-graphql';
import { Organization, OrganizationModel } from '../entities/Organization';
import { Flyer, FlyerModel } from '../entities/Flyer';
import organizationsJSON from '../../organizations.json';

/**
 * Reads organization info from static JSON and stores info in database.
 * @function
 * @returns {Organization []} An array of Organization objects.
 */
const addOrganizationsToDB = async (): Promise<void> => {
  const orgDocUpdates = [];

  for (const organization of organizationsJSON.organizations) {
    const { bio, name, slug, websiteURL, categorySlug } = organization;
    const orgDoc = Object.assign(new Organization(), {
      bio,
      name,
      slug,
      websiteURL,
      categorySlug,
    });

    // Add or update the organization created from the JSON
    orgDocUpdates.push(
      OrganizationModel.updateMany({ slug: { $eq: orgDoc.slug } }, orgDoc, { upsert: true }),
    );
  }

  await Promise.all(orgDocUpdates);
};

const getOrganizationsByCategory = async (categorySlug: string): Promise<Organization[]> => {
  return OrganizationModel.find({ categorySlug });
};

const getOrganizationByID = async (id: string): Promise<Organization> => {
  return OrganizationModel.findById(new ObjectId(id));
};

const getOrganizationsByIDs = async (ids: string[]): Promise<Organization[]> => {
  return Promise.all(ids.map((id) => OrganizationModel.findById(new ObjectId(id)))).then(
    (Organizations) => {
      // Filter out all null values that were returned by ObjectIds not associated
      // with Organizations in database
      return Organizations.filter((flyer) => flyer !== null);
    },
  );
};

const getOrganizationBySlug = async (slug: string): Promise<Organization> => {
  return OrganizationModel.findOne({ slug });
};

const getAllOrganizations = async (): Promise<Organization[]> => {
  return OrganizationModel.find({});
};

/**
 * Retrieves the Flyer object corresponding to the most recent flyer orglished
 * by a Organization.
 * @param {Organization} Organization
 * @returns {Flyer}
 */
const getMostRecentFlyer = async (organization: Organization): Promise<Flyer> => {
  // Due to the way Mongo interprets 'Organization' object,
  // Organization['_doc'] must be used to access fields of a Organization object
  return FlyerModel.findOne({
    organizationSlug: organization['_doc'].slug, // eslint-disable-line
  }).sort({ startDate: 'desc' });
};

/**
 * Retrieves the number of clicks an Organization has by summing the clicks
 * of all of its flyers.
 * @param {Organization} Organization
 * @returns {Number}
 */
const getClicks = async (organization: Organization): Promise<number> => {
  // Due to the way Mongo interprets 'Organization' object,
  // Organization['_doc'] must be used to access fields of a Organization object
  const orgFlyers = await FlyerModel.find({
    organizationSlug: organization['_doc'].slug, // eslint-disable-line
  });

  return orgFlyers.reduce((acc, flyer) => {
    return acc + flyer.timesClicked;
  }, 0);
};

/**
 * Retrieves the number of flyers in the database associated with this
 * Organization.
 * @param {Organization} organization
 * @returns {Number}
 */
const getNumFlyers = async (organization: Organization): Promise<number> => {
  // Due to the way Mongo interprets 'Organization' object,
  // Organization['_doc'] must be used to access fields of a Organization object
  const orgFlyers = await FlyerModel.find({
    organizationSlug: organization['_doc'].slug, // eslint-disable-line
  });

  return orgFlyers.length;
};

/**
 * Validate an organization slug and access code
 *
 * @param accessCode the non-hashed access code of the organization
 * @param slug the slug of the organization
 * @returns {Organization}
 */
const checkAccessCode = async (
  accessCode: string,
  slug: string,
): Promise<UnauthorizedError | Organization> => {
  // Get the hashed password given the slug
  const organization = await OrganizationModel.findOne({ slug });
  const hashedPassword = organization.accessCode;

  // Check the access code with the hashed password
  return compare(accessCode, hashedPassword).then(async (result) => {
    if (result) {
      return organization;
    }
    return new UnauthorizedError();
  });
};

export default {
  addOrganizationsToDB,
  checkAccessCode,
  getAllOrganizations,
  getClicks,
  getMostRecentFlyer,
  getNumFlyers,
  getOrganizationsByCategory,
  getOrganizationByID,
  getOrganizationsByIDs,
  getOrganizationBySlug,
};
