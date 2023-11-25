import { v4 as uuidv4 } from 'uuid';
import { Article } from '../entities/Article';
import ArticleRepo from './ArticleRepo';
import { OrganizationSlug, PublicationSlug } from '../common/types';
import { User, UserModel } from '../entities/User';
import { Magazine } from '../entities/Magazine';
import MagazineRepo from './MagazineRepo';
import { Flyer } from '../entities/Flyer';
import FlyerRepo from './FlyerRepo';
/**
 * Create new user associated with deviceToken and followedPublicationsSlugs of deviceType.
 */
const createUser = async (
  deviceToken: string,
  followedPublicationsSlugs: string[],
  deviceType: string,
): Promise<User> => {
  // Check if user associated with this deviceToken already exists
  const users = await UserModel.find({ deviceToken });

  // If no user, create a new one
  if (!users[0]) {
    // Create PublicationSlug objects from string of followed publications
    const followedPublications = followedPublicationsSlugs.map((slug) => new PublicationSlug(slug));
    const uuid = uuidv4();
    const newUser = Object.assign(new User(), {
      uuid,
      deviceToken,
      followedPublications,
      deviceType,
      weeklyDebrief: null,
      readArticles: [],
    });
    return UserModel.create(newUser);
  }
  return users[0];
};

/**
 * Adds publication slug to user's followedPublications.
 */
const followPublication = async (uuid: string, slug: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });

  if (user) {
    user.followedPublications.push(new PublicationSlug(slug));
    return user.save();
  }
  return user;
};

/**
 * Deletes publication slug from user's followedPublications.
 */
const unfollowPublication = async (uuid: string, pubSlug: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });
  if (user) {
    const pubSlugs = user.followedPublications.map((pubSlugObj) => pubSlugObj.slug);
    const pubIndex = pubSlugs.indexOf(pubSlug);

    if (pubIndex === -1) return user;

    user.followedPublications.splice(pubIndex, 1);
    return user.save();
  }
  return user;
};

/**
 * Adds organization slug to user's followedOrganizations.
 * Requires: the user is not already following the organization.
 */
const followOrganization = async (uuid: string, slug: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });

  if (user) {
    user.followedOrganizations.push(new OrganizationSlug(slug));
    return user.save();
  }
  return user;
};

/**
 * Deletes organization slug from user's followedOrganizations.
 */
const unfollowOrganization = async (uuid: string, orgSlug: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });
  if (user) {
    const orgSlugs = user.followedOrganizations.map((orgSlugObj) => orgSlugObj.slug);
    const orgIndex = orgSlugs.indexOf(orgSlug);

    if (orgIndex === -1) return user;

    user.followedOrganizations.splice(orgIndex, 1);
    return user.save();
  }
  return user;
};

const getUserByUUID = async (uuid: string): Promise<User> => {
  return UserModel.findOne({ uuid });
};

/**
 * Return all users who follow a publication.
 */
const getUsersFollowingPublication = async (pubSlug: string): Promise<User[]> => {
  const matchedUsers = await UserModel.find({
    followedPublications: { $elemMatch: { slug: pubSlug } },
  });
  return matchedUsers;
};

/**
 * Return all users who follow an organization
 */
const getUsersFollowingOrganization = async (orgSlug: string): Promise<User[]> => {
  const matchedUsers = await UserModel.find({
    followedOrganizations: { $elemMatch: { slug: orgSlug } },
  });
  return matchedUsers;
};

/**
 * Add article to a user's readArticles
 */
const appendReadArticle = async (uuid: string, articleID: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });

  if (user) {
    const article = await ArticleRepo.getArticleByID(articleID);
    const checkDuplicates = (prev: boolean, cur: Article) => prev || cur.id === articleID;

    if (article && !user.readArticles.reduce(checkDuplicates, false)) {
      user.readArticles.push(article);
    }

    user.save();
  }
  return user;
};

/**
 * Add a flyer to a user's readFlyers
 */
const appendReadFlyer = async (uuid: string, flyerID: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });

  if (user) {
    const flyer = await FlyerRepo.getFlyerByID(flyerID);
    const checkDuplicates = (prev: boolean, cur: Flyer) => prev || cur.id === flyerID;

    if (flyer && !user.readFlyers.reduce(checkDuplicates, false)) {
      user.readFlyers.push(flyer);
    }

    user.save();
  }
  return user;
};

/**
 * Add a magazine to a user's read
 */
const appendReadMagazine = async (uuid: string, magazineID: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });

  if (user) {
    const magazine = await MagazineRepo.getMagazineByID(magazineID);
    const checkDuplicates = (prev: boolean, cur: Magazine) => prev || cur.id === magazineID;

    if (magazine && !user.readMagazines.reduce(checkDuplicates, false)) {
      user.readMagazines.push(magazine);
    }

    user.save();
  }
  return user;
};

/**
 * Increment shoutouts in user's numShoutouts
 */
const incrementShoutouts = async (uuid: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });

  if (user) {
    user.numShoutouts++;
    user.save();
  }

  return user;
};

/**
 * Add article to a user's bookmarkedArticles
 */
const bookmarkArticle = async (uuid: string, articleID: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });

  if (user) {
    const article = await ArticleRepo.getArticleByID(articleID);
    const checkDuplicates = (prev: boolean, cur: Article) => prev || cur.id === articleID;

    if (article && !user.bookmarkedArticles.reduce(checkDuplicates, false)) {
      user.bookmarkedArticles.push(article);
    }

    user.save();
  }

  return user;
};

/**
 * Add magazine to a user's bookmarkedMagazines
 */
const bookmarkMagazine = async (uuid: string, magazineID: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });

  if (user) {
    const magazine = await MagazineRepo.getMagazineByID(magazineID);
    const checkDuplicates = (prev: boolean, cur: Magazine) => prev || cur.id === magazineID;

    if (magazine && !user.bookmarkedMagazines.reduce(checkDuplicates, false)) {
      user.bookmarkedMagazines.push(magazine);
    }

    user.save();
  }

  return user;
};

/**
 * Add flyer to a user's bookmarkedFlyers
 */
const bookmarkFlyer = async (uuid: string, flyerID: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });

  if (user) {
    const flyer = await FlyerRepo.getFlyerByID(flyerID);
    const checkDuplicates = (prev: boolean, cur: Flyer) => prev || cur.id === flyerID;

    if (flyer && !user.bookmarkedFlyers.reduce(checkDuplicates, false)) {
      user.bookmarkedFlyers.push(flyer);
    }

    user.save();
  }

  return user;
};

/**
 * Remove article from a user's bookmarkedArticles
 */
const unbookmarkArticle = async (uuid: string, articleID: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });
  if (user) {
    const articleSlugs = user.bookmarkedArticles.map((article) => article.id);
    const articleIndex = articleSlugs.indexOf(articleID);

    if (articleIndex === -1) return user;

    user.bookmarkedArticles.splice(articleIndex, 1);
    return user.save();
  }
  return user;
};

/**
 * Remove magazine from a user's bookmarkedMagazines
 */
const unbookmarkMagazine = async (uuid: string, magazineID: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });
  if (user) {
    const magazineSlugs = user.bookmarkedMagazines.map((magazine) => magazine.id);
    const magazineIndex = magazineSlugs.indexOf(magazineID);

    if (magazineIndex === -1) return user;

    user.bookmarkedMagazines.splice(magazineIndex, 1);
    return user.save();
  }
  return user;
};

/**
 * Remove flyer from a user's bookmarkedFlyers
 */
const unbookmarkFlyer = async (uuid: string, flyerID: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });
  if (user) {
    const flyerSlugs = user.bookmarkedFlyers.map((flyer) => flyer.id);
    const flyerIndex = flyerSlugs.indexOf(flyerID);

    if (flyerIndex === -1) return user;

    user.bookmarkedFlyers.splice(flyerIndex, 1);
    return user.save();
  }
  return user;
};

export default {
  appendReadArticle,
  appendReadMagazine,
  appendReadFlyer,
  createUser,
  followPublication,
  unfollowOrganization,
  followOrganization,
  getUserByUUID,
  getUsersFollowingPublication,
  getUsersFollowingOrganization,
  bookmarkArticle,
  bookmarkMagazine,
  bookmarkFlyer,
  unbookmarkArticle,
  unbookmarkMagazine,
  unbookmarkFlyer,
  incrementShoutouts,
  unfollowPublication,
};
