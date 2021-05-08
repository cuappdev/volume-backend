import { User, UserModel } from '../entities/User';

/**
 * Create new user.
 */
const createUser = async (id: string, deviceToken: string, followedPublications: string[]): Promise<User> => {
  const newUser = Object.assign(new User(), {
    id,
    deviceToken,
    followedPublications
  });

  // Add or update the user in the database
  const user = await UserModel.updateMany({ id: { $eq: newUser.id } }, newUser, { upsert: true }).exec();

  return user;
};

/** 
 * Return all users who follow a publication.
 */
const getUsersFollowingPublication = async (publicationID: string): Promise<User[]> => {
  const users = await UserModel.find();
  users.filter((u) => { u.followedPublications.includes(publicationID) });
  return users;
};

export default {
  createUser,
  getUsersFollowingPublication
};
