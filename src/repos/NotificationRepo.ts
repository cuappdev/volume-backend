import * as admin from 'firebase-admin';
import { User } from '../entities/User';
import { Publication } from '../entities/Publication';
import { Article } from '../entities/Article';
import UserRepo from './UserRepo';
import PublicationRepo from './PublicationRepo';
import ArticleRepo from './ArticleRepo';
import { Magazine } from '../entities/Magazine';
import MagazineRepo from './MagazineRepo';

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
const notifyNewArticles = async (articleIDs: string[]): Promise<void> => {
  articleIDs.forEach(async (a) => {
    const article = await ArticleRepo.getArticleByID(a); // eslint-disable-line
    const publication = await PublicationRepo.getPublicationBySlug(article.publicationSlug);
    const followers = await UserRepo.getUsersFollowingPublication(article.publicationSlug);
    followers.forEach(async (follower) => {
      sendNewArticleNotification(follower, article, publication);
    });
  });
};

const sendNewMagazineNotification = async (
  user: User,
  magazine: Magazine,
  publication: Publication,
): Promise<void> => {
  const { deviceToken } = user;

  const notifTitle = publication.name;
  const notifBody = magazine.title;

  const message = {
    notification: {
      title: notifTitle,
      body: notifBody,
    },
    data: {
      userID: user.uuid,
      magazineID: magazine.id,
      magazinePDF: magazine.pdfURL,
      notificationType: 'new_magazine',
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
 * Send notifications for new magazines have been posted by publications.
 */
const notifyNewMagazines = async (magazineIDs: string[]): Promise<void> => {
  magazineIDs.forEach(async (m) => {
    const magazine = await MagazineRepo.getMagazineByID(m); // eslint-disable-line
    const publication = await PublicationRepo.getPublicationBySlug(magazine.publicationSlug);
    const followers = await UserRepo.getUsersFollowingPublication(magazine.publicationSlug);
    followers.forEach(async (follower) => {
      sendNewMagazineNotification(follower, magazine, publication);
    });
  });
};

const sendWeeklyDebriefNotification = async (user: User): Promise<void> => {
  // Get device token of user
  const { deviceToken } = user;

  const notifTitle = 'Your Weekly Debrief is Ready';
  const notifBody = 'Click to check out whats new on Volume this week!';

  const message = {
    notification: {
      title: notifTitle,
      body: notifBody,
    },
    data: {
      userID: user.uuid,
      notifcationType: 'weekly_debrief',
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
 * Send notifications for weekly debrief release.
 */
const notifyWeeklyDebrief = async (users: User[]): Promise<void> => {
  users.forEach(async (user) => {
    sendWeeklyDebriefNotification(user);
  });
};
export default {
  sendNewArticleNotification,
  sendNewMagazineNotification,
  sendWeeklyDebriefNotification,
  notifyNewArticles,
  notifyNewMagazines,
  notifyWeeklyDebrief,
};
