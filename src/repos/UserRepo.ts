import { ObjectId } from 'mongodb';
import { User, UserModel } from '../entities/User';

/**
 * Create new user.
 */
const createUser = async (
  id: string,
  deviceToken: string,
  followedPublications: string[],
  notification,
): Promise<User> => {
  const newUser = Object.assign(new User(), {
    id,
    deviceToken,
    followedPublications,
    notification,
  });

  // Add or update the user in the database
  // make sure that this 1. updates device_token if it changes, 2. updates following publication if it changes(check definition of upsert)
  const user = await UserModel.updateMany({ id: { $eq: newUser.id } }, newUser, {
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
