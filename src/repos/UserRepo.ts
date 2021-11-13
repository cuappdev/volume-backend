import { v4 as uuidv4 } from 'uuid';
import { User, UserModel } from '../entities/User';
import WeeklyDebrief from '../entities/WeeklyDebrief';
import PublicationRepo from './PublicationRepo';
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
    // create PublicationID obejcts from string of followed publications
    const followedPublications = followedPublicationsIDs.map((id) => {
      return Object.assign(new PublicationID(), { id });
    });
    const uuid = uuidv4();

    const weeklyDebrief = Object.assign(new WeeklyDebrief(), {
      uuid,
      createdAt: new Date('December 17, 1995 03:24:00'),
      expirationDate: new Date('December 17, 1995 03:24:00'),
      numShoutouts: 0,
      readArticles: [],
      randomArticles: [],
    });

    const newUser = Object.assign(new User(), {
      uuid,
      deviceToken,
      followedPublications,
      deviceType,
      weeklyDebrief,
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
  user.followedPublications.push(Object.assign(new PublicationID(), { id: pubID }));
  return user.save();
};

/**
 * Deletes publication of pubID from user represented by uuid's followedPublications.
 */
const unfollowPublication = async (uuid: string, pubID: string): Promise<User> => {
  const user = await UserModel.findOne({ uuid });
  const pubIDs = user.followedPublications.map((pubIDObject) => {
    return pubIDObject.id;
  });
  const pubIndex = pubIDs.indexOf(pubID);
  if (pubIndex === -1) {
    return user;
  }
  user.followedPublications.splice(pubIndex, 1);
  return user.save();
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

export default {
  createUser,
  getUserByUUID,
  getUsersFollowingPublication,
  followPublication,
  unfollowPublication,
};
