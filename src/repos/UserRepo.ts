import { v4 as uuidv4 } from 'uuid';
import { User, UserModel } from '../entities/User';
import PublicationRepo from './PublicationRepo';
import ArticleRepo from './ArticleRepo';
import { Article } from '../entities/Article';
import { PublicationID } from '../common/types';

/**
 * Create new user associated with deviceToken and followedPublicationsIDs of deviceType.
 */
const createUser = async (
  deviceToken: string,
  followedPublicationsIDs: string[],
  deviceType: string,
): Promise<User> => {
  // check if user associated with this deviceToken already exists
  const users = await UserModel.find({ deviceToken });

  // if no user, create a new one
  if (!users[0]) {
    // create PublicationID objects from string of followed publications
    const followedPublications = followedPublicationsIDs.map((id) => {
      return Object.assign(new PublicationID(), { id });
    });
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
 * Adds publication of pubID to user represented by uuid's followedPublications.
 */
const followPublication = async (uuid: string, pubID: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });
  if (user) {
    user.followedPublications.push(Object.assign(new PublicationID(), { id: pubID }));
    return user.save();
  }
  return user;
};

/**
 * Deletes publication of pubID from user represented by uuid's followedPublications.
 */
const unfollowPublication = async (uuid: string, pubID: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });
  if (user) {
    const pubIDs = user.followedPublications.map((pubIDObject) => {
      return pubIDObject.id;
    });
    const pubIndex = pubIDs.indexOf(pubID);
    if (pubIndex === -1) {
      return user;
    }
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
  const publication = await PublicationRepo.getPublicationBySlug(pubSlug);
  // WARNING TODO: linear scan on DB, inefficient <-- turn into a query that just gets users following publications
  const users = await UserModel.find();
  users.filter((u) => {
    u.followedPublications.map((id) => id.id).includes(publication.id);
  });
  return users;
};

/**
 * Add article to a user's readArticles
 */
const appendReadArticle = async (uuid: string, articleID: string): Promise<User> => {
  const article = await ArticleRepo.getArticleByID(articleID);
  const user = await UserModel.findOne({ uuid });
  const checkDuplicates = (prev: boolean, cur: Article) => prev || cur.id === articleID;
  if (!user) {
    return user;
  }
  if (article) {
    if (!user.readArticles.reduce(checkDuplicates, false)) {
      user.readArticles.push(article);
    }
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
    user.numShoutouts += 1;
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
    user.numBookmarkedArticles += 1;
    user.save();
  }
  return user;
};

export default {
  createUser,
  incrementShoutouts,
  incrementBookmarks,
  appendReadArticle,
  getUserByUUID,
  getUsersFollowingPublication,
  followPublication,
  unfollowPublication,
};
