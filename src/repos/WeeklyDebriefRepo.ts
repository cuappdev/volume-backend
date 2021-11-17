import { User, UserModel } from '../entities/User';
import WeeklyDebrief from '../entities/WeeklyDebrief';
import { ArticleModel } from '../entities/Article';

const getExpirationDate = (createdAt: Date): Date => {
  createdAt.setDate(createdAt.getDate() + 7);
  return createdAt;
};

const createWeeklyDebrief = async (
  user: User,
  createdAt: Date,
  expirationDate: Date,
): Promise<void> => {
  const articleAggregate = ArticleModel.aggregate();

  articleAggregate.sample(2);
  const weeklyDebrief = Object.assign(new WeeklyDebrief(), {
    uuid: user.uuid,
    createdAt,
    expirationDate,
    numShoutouts: user.shoutouts,
    readArticles: user.articlesRead,
    randomArticles: articleAggregate,
  });
  UserModel.updateOne(
    { uuid: user.uuid },
    {
      shoutouts: 0,
      articlesRead: [],
      weeklyDebrief,
    },
  );
};

const createWeeklyDebriefs = async (uuids: [string]): Promise<void> => {
  const createdAt = new Date();
  const expDate = new Date();
  expDate.setDate(createdAt.getDate() + 7);
  UserModel.find().then((users) =>
    users.map((user) => createWeeklyDebrief(user, createdAt, expDate)),
  );
};

export default {
  createWeeklyDebriefs,
  getExpirationDate,
};
