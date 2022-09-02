import * as admin from 'firebase-admin';
import { User } from '../entities/User';
import { Publication } from '../entities/Publication';
import { Article } from '../entities/Article';
import UserRepo from './UserRepo';
import PublicationRepo from './PublicationRepo';
import ArticleRepo from './ArticleRepo';

const sendNewArticleNotification = async (
  user: User,
  article: Article,
  publication: Publication,
): Promise<void> => {
  const { deviceToken } = user;

  const notifTitle = publication.name;
  const notifBody = article.title;

  const message = {
    notification: {
      title: notifTitle,
      body: notifBody,
    },
    data: {
      userID: user.uuid,
      articleID: article.id,
      articleURL: article.articleURL,
      notificationType: 'new_article',
    },
  };

  const options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24,
  };

  // Send notification to FCM servers
  admin
    .messaging()
    .sendToDevice(deviceToken, message, options)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
};

/**
 * Send notifications for new articles have been posted by publications.
 */
const notify = async (articleIDs: string[]): Promise<void> => {
  articleIDs.forEach(async (a) => {
    const article = await ArticleRepo.getArticleByID(a); // eslint-disable-line
    const publication = await PublicationRepo.getPublicationBySlug(article.publicationSlug);
    const followers = await UserRepo.getUsersFollowingPublication(article.publicationSlug);
    followers.forEach(async (follower) => {
      sendNewArticleNotification(follower, article, publication);
    });
  });
};

export default {
  sendNewArticleNotification,
  notify,
};
