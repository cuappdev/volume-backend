import { DocumentType } from '@typegoose/typegoose';
import { User, UserModel } from '../entities/User';
import WeeklyDebrief from '../entities/WeeklyDebrief';
import { ArticleModel } from '../entities/Article';

const getExpirationDate = (createdAt: Date): Date => {
  createdAt.setDate(createdAt.getDate() + 7);
  return createdAt;
};

const createWeeklyDebrief = async (
  user: DocumentType<User>,
  createdAt: Date,
  expirationDate: Date,
): Promise<User> => {
  const articleAggregate = ArticleModel.aggregate();
  const { uuid } = user;
  const weeklyDebrief = Object.assign(new WeeklyDebrief(), {
    uuid,
    createdAt,
    expirationDate,
    numShoutouts: user.numShoutouts,
    numBookmarkedArticles: user.numBookmarkedArticles,
    readArticles: user.readArticles.slice(0, 2),
    numReadArticles: user.readArticles.length,
    randomArticles: await articleAggregate.sample(2).exec(),
  });
  return UserModel.findOneAndUpdate(
    { uuid },
    {
      $set: {
        readArticles: [],
        numShoutouts: 0,
        numBookmarkedArticles: 0,
        weeklyDebrief,
      },
    },
    { new: true },
  );
};

const createWeeklyDebriefs = async (): Promise<User[]> => {
  const createdAt = new Date();
  const expDate = new Date();
  expDate.setDate(createdAt.getDate() + 7);
  const userList = UserModel.find({}).then((users) =>
    Promise.all(users.map((user) => createWeeklyDebrief(user, createdAt, expDate))),
  );
  return userList;
};

export default {
  createWeeklyDebriefs,
  getExpirationDate,
};
