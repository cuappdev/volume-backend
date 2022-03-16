import { DocumentType } from '@typegoose/typegoose';
import { User, UserModel } from '../entities/User';
import WeeklyDebrief from '../entities/WeeklyDebrief';
import { ArticleModel } from '../entities/Article';
import { DAYS_IN_WEEK } from '../common/constants'

const getExpirationDate = (creationDate: Date): Date => {
  creationDate.setDate(creationDate.getDate() + DAYS_IN_WEEK);
  return creationDate;
};

const createWeeklyDebrief = async (
  user: DocumentType<User>,
  creationDate: Date,
  expirationDate: Date,
): Promise<User> => {
  const articleAggregate = ArticleModel.aggregate();
  const { uuid } = user;
  const weeklyDebrief = Object.assign(new WeeklyDebrief(), {
    uuid,
    creationDate,
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
    { new: true, useFindAndModify: false },
  );
};

const createWeeklyDebriefs = async (): Promise<User[]> => {
  const creationDate = new Date();
  const expDate = new Date();
  expDate.setDate(creationDate.getDate() + DAYS_IN_WEEK);
  const userList = UserModel.find({}).then((users) =>
    Promise.all(users.map((user) => createWeeklyDebrief(user, creationDate, expDate))),
  );
  return userList;
};

export default {
  createWeeklyDebriefs,
  getExpirationDate,
};