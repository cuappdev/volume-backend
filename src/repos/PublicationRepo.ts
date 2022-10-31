import { ObjectId } from 'mongodb';
import { Publication, PublicationModel } from '../entities/Publication';
import { Article, ArticleModel } from '../entities/Article';
import { Social } from '../common/types';
import { IMAGE_ADDRESS } from '../common/constants';
import publicationsJSON from '../../publications.json';

function getImageURLs(slug: string): [string, string] {
  return [`${IMAGE_ADDRESS}/${slug}/background.png`, `${IMAGE_ADDRESS}/${slug}/profile.png`];
}

/**
 * Reads publication info from static JSON and stores info in database.
 * @function
 * @returns {Publication []} An array of Publication objects.
 */
const addPublicationsToDB = async (): Promise<void> => {
  const pubDocUpdates = [];

  for (const publication of publicationsJSON.publications) {
    const { bio, bioShort, rssName, rssURL, name, slug, websiteURL } = publication;
    const [backgroundImageURL, profileImageURL] = getImageURLs(slug);
    const pubDoc = Object.assign(new Publication(), {
      backgroundImageURL,
      bio,
      bioShort,
      name,
      profileImageURL,
      rssName,
      rssURL,
      slug,
      websiteURL,
    });

    // Add or update the publication created from the JSON
    pubDocUpdates.push(
      PublicationModel.updateMany({ slug: { $eq: pubDoc.slug } }, pubDoc, { upsert: true }),
    );
  }

  await Promise.all(pubDocUpdates);
};

const getPublicationByID = async (id: string): Promise<Publication> => {
  return PublicationModel.findById(new ObjectId(id));
};

const getPublicationsByIDs = async (ids: string[]): Promise<Publication[]> => {
  return Promise.all(ids.map((id) => PublicationModel.findById(new ObjectId(id)))).then(
    (publications) => {
      // Filter out all null values that were returned by ObjectIds not associated
      // with publications in database
      return publications.filter((article) => article !== null);
    },
  );
};

const getPublicationBySlug = async (slug: string): Promise<Publication> => {
  return PublicationModel.findOne({ slug });
};

const getAllPublications = async (): Promise<Publication[]> => {
  return PublicationModel.find({});
};

/**
 * Retrieves the Article object corresponding to the most recent article published
 * by a publication.
 * @param {Publication} publication
 * @returns {Article}
 */
const getMostRecentArticle = async (publication: Publication): Promise<Article> => {
  // Due to the way Mongo interprets 'publication' object,
  // publication['_doc'] must be used to access fields of a publication object
  return ArticleModel.findOne({
    publicationSlug: publication['_doc'].slug, // eslint-disable-line
  }).sort({ date: 'desc' });
};

/**
 * Retrieves the number of shoutouts a Publication has by summing the shoutouts
 * of all of its articles.
 * @param {Publication} publication
 * @returns {Number}
 */
const getShoutouts = async (publication: Publication): Promise<number> => {
  // Due to the way Mongo interprets 'publication' object,
  // publication['_doc'] must be used to access fields of a publication object
  const pubArticles = await ArticleModel.find({
    publicationSlug: publication['_doc'].slug, // eslint-disable-line
  });

  return pubArticles.reduce((acc, article) => {
    return acc + article.shoutouts;
  }, 0);
};

/**
 * Retrieves the number of articles in the database associated with this
 * publication.
 * @param {Publication} publication
 * @returns {Number}
 */
const getNumArticles = async (publication: Publication): Promise<number> => {
  // Due to the way Mongo interprets 'publication' object,
  // publication['_doc'] must be used to access fields of a publication object
  const pubArticles = await ArticleModel.find({
    publicationSlug: publication['_doc'].slug, // eslint-disable-line
  });

  return pubArticles.length;
};

/**
 * Maps list of dictionaries containing social platform with URL information to
 * list of SocialURLTuple types.
 */
function getSocialURLsHelper(socialsList) {
  const socialsTupleList = socialsList.map(({ social, URL }) => {
    return Object.assign(new Social(), { social, URL });
  });
  return socialsTupleList;
}

/**
 * Retrieves informations about a publications social platforms.
 * @param {Publication} publication
 * @returns {Social[]}
 */
const getSocialURLs = async (publication: Publication): Promise<Social[]> => {
  const pubSlug = publication['_doc'].slug; // eslint-disable-line
  // Reference publications json for social information
  const publicationsDB = publicationsJSON.publications;
  // Find publication in json associated with slug
  const pub = publicationsDB.filter((p) => p.slug === pubSlug)[0];
  const socialsURLs = getSocialURLsHelper(pub.socialURLs);
  return socialsURLs;
};

/**
 * Retrieves informations about a publications content types.
 * @param {Publication} publication
 * @returns {string[]}
 */
const getContentTypes = async (publication: Publication): Promise<string[]> => {
  const contentTypes = publication['_doc'].contentTypes; // eslint-disable-line
  return contentTypes[0];
};

export default {
  addPublicationsToDB,
  getAllPublications,
  getMostRecentArticle,
  getNumArticles,
  getPublicationByID,
  getPublicationBySlug,
  getPublicationsByIDs,
  getShoutouts,
  getSocialURLs,
  getContentTypes,
};
