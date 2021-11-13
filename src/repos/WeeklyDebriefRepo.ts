import { UserModel } from '../entities/User';
import UserRepo from './UserRepo';
import WeeklyDebrief from '../entities/WeeklyDebrief';
import { ArticleModel } from '../entities/Article';

const getExpirationDate = (createdAt: Date): Date => {
  createdAt.setDate(createdAt.getDate() + 7);
  return createdAt;
};

const createWeeklyDebrief = async (
  uuid: string,
  createdAt: Date,
  expirationDate: Date,
): Promise<void> => {
  const user = await UserRepo.getUserByUUID(uuid);
  const articleAggregate = ArticleModel.aggregate();

  articleAggregate.sample(2);
  const weeklyDebrief = Object.assign(new WeeklyDebrief(), {
    uuid,
    createdAt,
    expirationDate,
    numShoutouts: user.shoutouts,
    readArticles: user.articlesRead,
    randomArticles: articleAggregate,
  });
  console.log(weeklyDebrief);
  UserModel.updateOne(
    { uuid },
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
  uuids.map((uuid) => createWeeklyDebrief(uuid, createdAt, expDate));
};

export default {
  createWeeklyDebriefs,
  getExpirationDate,
};
