import { v4 as uuidv4 } from 'uuid';
import { Article } from '../entities/Article';
import ArticleRepo from './ArticleRepo';
import { PublicationSlug } from '../common/types';
import { User, UserModel } from '../entities/User';

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
 * Add article to a user's readArticles
 */
const appendReadArticle = async (uuid: string, articleID: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });

  if (!user) return user;

  const article = await ArticleRepo.getArticleByID(articleID);
  const checkDuplicates = (prev: boolean, cur: Article) => prev || cur.id === articleID;

  if (article && !user.readArticles.reduce(checkDuplicates, false)) {
    user.readArticles.push(article);
  }

  user.save();
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
 * Increment number of bookmarks in user's numBookmarkedArticles
 */
const incrementBookmarks = async (uuid: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });

  if (user) {
    user.numBookmarkedArticles++;
    user.save();
  }

  return user;
};

export default {
  appendReadArticle,
  createUser,
  followPublication,
  getUserByUUID,
  getUsersFollowingPublication,
  incrementBookmarks,
  incrementShoutouts,
  unfollowPublication,
};
