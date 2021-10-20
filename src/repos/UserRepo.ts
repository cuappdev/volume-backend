import { ObjectId } from 'mongodb';
import { User, UserModel } from '../entities/User';

/**
 * Create new pseudo suser.
 */
const createUser = async (
  deviceToken: string,
  followedPublications: string[],
  notification: string,
): Promise<User> => {
  // generate a uuid
  const uuid = '';
  const newUser = Object.assign(new User(), {
    uuid,
    deviceToken,
    followedPublications,
    notification,
  });

  // Add or update the user in the database
  // make sure that this 1. updates device_token if it changes, 2. updates following publication if it changes
  const user = await UserModel.updateMany({ uuid: { $eq: newUser.uuid } }, newUser, {
    upsert: true,
  }).exec();

  return user;
};

const getUserByID = async (id: string): Promise<User> => {
  return UserModel.findById(new ObjectId(id));
};

/**
 * Return all users who follow a publication.
 */
const getUsersFollowingPublication = async (publicationID: string): Promise<User[]> => {
  const users = await UserModel.find();
  users.filter((u) => {
    u.followedPublications.includes(publicationID);
  });
  return users;
};

export default {
  createUser,
  getUserByID,
  getUsersFollowingPublication,
};
