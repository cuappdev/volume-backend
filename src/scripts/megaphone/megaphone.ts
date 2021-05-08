import { ObjectId } from 'mongodb';
import { ANDROID, IOS } from '../common/constants';
import { ArticleModel } from '../../entities/Article';
import UserRepo from '../../repos/UserRepo';
import NotificationRepo from '../../repos/NotificationRepo';
import ArticleRepo from '../../repos/ArticleRepo';

/**
 * Send notifications for new articles have been posted by publications.
 */
(async () => {
  // Get all articles that have been put in database but haven't had notifications sent
  const articles = await ArticleModel.find({ notificationSent: false }).exec();

  // Send notifications to everyone following the publication associated with this article
  articles.forEach(async (a) => {
    const article = await ArticleRepo.getArticleByID(a._id);
    const publication = article.publicationSlug;
    const followers = await UserRepo.getUsersFollowingPublication(publication);
    followers.forEach(async (follower) => {
      if (follower.notification == ANDROID)
        NotificationRepo.sendIOSNotification(follower.id, article.id, publication);
      if (follower.notification == IOS)
        NotificationRepo.sendAndroidNotification(follower.id, article.id, publication);
    });
  });

  articles.forEach(async (a) => {
    const article = await ArticleModel.findById(new ObjectId(a._id)); // eslint-disable-line //(must query using article model when attempting to save due to types)
    article.notificationSent = true;
    await article.save();
  });
})();
