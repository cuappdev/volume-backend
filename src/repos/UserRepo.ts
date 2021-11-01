import { v4 as uuidv4 } from 'uuid';
import { User, UserModel } from '../entities/User';
import { PublicationID } from '../common/types';

/**
 * Create new pseudo suser.
 */
const createUser = async (
  deviceToken: string,
  followedPublicationsIDs: string[],
  deviceType: string,
): Promise<User> => {
  // create PublicationID obejcts from string of followed publications
  const followedPublications = followedPublicationsIDs.map((id) => {
    return Object.assign(new PublicationID(), { id });
  });

  const uuid = uuidv4();
  const newUser = Object.assign(new User(), {
    uuid,
    deviceToken,
    followedPublications,
    deviceType,
  });

  return UserModel.create(newUser);
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
  if (pubIDs.indexOf(pubID) === -1) {
    return user;
  }
  user.followedPublications.splice(pubIDs.indexOf(pubID), 1);
  return user.save();
};

const getUserByUUID = async (uuid: string): Promise<User> => {
  return UserModel.findOne({ uuid });
};

/**
 * Return all users who follow a publication.
 */
const getUsersFollowingPublication = async (pubID: PublicationID): Promise<User[]> => {
  const users = await UserModel.find(); // linear scan on DB, inefficient
  users.filter((u) => {
    u.followedPublications.map((id) => id.id).includes(pubID.id);
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
