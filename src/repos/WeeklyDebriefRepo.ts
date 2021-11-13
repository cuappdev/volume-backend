import { ObjectId } from 'mongodb';
import { User, UserModel } from '../entities/User';
import WeeklyDebrief from '../entities/WeeklyDebrief';

const createWeeklyDebrief = async (uuid: string): Promise<WeeklyDebrief> => {

}
const getWeeklyDebrief = async (uuid: string): Promise<WeeklyDebrief> => {
  const user =await  UserModel.findOne({ uuid });
  return 
};
/* - function createWeeklyDebrief
    - expiration = current date + 7 days
    - random_articles = get 2 random articles
    - timestamp or week = current week
    - for each user
        - user.weekly_debrief.read_articles = user.read_articles
            - any two articles they read from list
        - user.weekly_debrief.shoutouts = user.shoutouts
        - user.weekly_debrief.expiration_date = expiration_date
        - user.weekly_debrief.random_article = random_articles
        - user.shoutouts = 0
        - user.read_articles []
        
*/
const getExpirationDate = async (createdAt: Date): Promise<Date> => {
  createdAt.setDate(createdAt.getDate() + 7);
  return createdAt;
};
export default {
  getWeeklyDebrief,
  getExpirationDate,
};
