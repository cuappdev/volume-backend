import apn from 'apn';
import * as admin from 'firebase-admin';
import { User } from '../entities/User';
import { Publication } from '../entities/Publication';
import { Article } from '../entities/Article';
import UserRepo from './UserRepo';
import PublicationRepo from './PublicationRepo';
import ArticleRepo from './ArticleRepo';
import { ANDROID, IOS } from '../common/constants';

/**
 * Send IOS push notification to {userID} about an {articleID} that {publicationSlug} posted.
 */
const sendNewArticleIOSNotification = async (
  user: User,
  article: Article,
  publication: Publication,
): Promise<void> => {
  // Get device token of user
  const { deviceToken } = user;

  // Setup IOS Admin
  const apnProvider = new apn.Provider({
    token: {
      key: process.env.APNS_TOKEN_PATH,
      keyId: process.env.APNS_KEY_ID,
      teamId: process.env.APNS_TEAM_ID,
    },
  });

  const notifTitle = publication.name;
  const notifBody = article.title;

  const note = new apn.Notification({
    alert: {
      title: notifTitle,
      body: notifBody,
    },
  });

  note.expiry = Math.floor(Date.now() / 1000) + 3600;
  note.badge = 3;
  note.sound = 'ping.aiff';
  note.payload = {
    messageFrom: 'Volume',
    userID: user.uuid,
    articleURL: article.articleURL,
    articleID: article.id,
    notificationType: 'new_article',
  };
  note.topic = process.env.APNS_BUNDLE_ID;

  // Send notification to APN servers
  apnProvider.send(note, deviceToken).then((result) => {
    console.log(result.sent);
    console.log(result.failed);
  });
};

/**
 * Send Android push notification to {userID} about an {articleID} that {publicationSlug} posted.
 */
const sendNewArticleAndroidNotification = async (
  user: User,
  article: Article,
  publication: Publication,
): Promise<void> => {
  // Get device token of user
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
      notifcationType: 'new_article',
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
 * Send IOS push notification to {userID} that their weekly debrief is ready.
 */
const sendWeeklyDebriefIOSNotification = async (user: User): Promise<void> => {
  // Get device token of user
  const { deviceToken } = user;

  // Setup IOS Admin
  const apnProvider = new apn.Provider({
    token: {
      key: process.env.APNS_TOKEN_PATH,
      keyId: process.env.APNS_KEY_ID,
      teamId: process.env.APNS_TEAM_ID,
    },
  });

  const notifTitle = 'Your Weekly Debrief is Ready';
  const notifBody = 'Click to check out whats new in Volume this week!';

  const note = new apn.Notification({
    alert: {
      title: notifTitle,
      body: notifBody,
    },
  });

  note.expiry = Math.floor(Date.now() / 1000) + 3600;
  note.badge = 3;
  note.sound = 'ping.aiff';
  note.payload = {
    messageFrom: 'Volume',
    userID: user.uuid,
    notifcationType: 'weekly_debrief',
  };
  note.topic = process.env.APNS_BUNDLE_ID;

  // Send notification to APN servers
  apnProvider.send(note, deviceToken).then((result) => {
    console.log(result.sent);
    console.log(result.failed);
  });
};

/**
 * Send Android push notification to {userID} that their weekly debrief is ready.
 */
const sendWeeklyDebriefAndroidNotification = async (user: User): Promise<void> => {
  // Get device token of user
  const { deviceToken } = user;

  const notifTitle = 'Your Weekly Debrief is Ready';
  const notifBody = 'Click to check out whats new in Volume this week!';

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
 * Send notifications for new articles have been posted by publications.
 */
const notifyNewArticles = async (articleIDs: string[]): Promise<void> => {
  articleIDs.forEach(async (a) => {
    const article = await ArticleRepo.getArticleByID(a); // eslint-disable-line
    const publication = await PublicationRepo.getPublicationBySlug(article.publicationSlug);
    // get all the followers of publication this article was posted by
    const followers = await UserRepo.getUsersFollowingPublication(article.publicationSlug);
    // send notifications to each follower that publication posted article
    followers.forEach(async (follower) => {
      if (follower.deviceType === ANDROID) {
        sendNewArticleAndroidNotification(follower, article, publication);
      }
      if (follower.deviceType === IOS) {
        sendNewArticleIOSNotification(follower, article, publication);
      }
    });
  });
};

/**
 * Send notifications for new articles have been posted by publications.
 */
const notifyWeeklyDebrief = async (users: User[]): Promise<void> => {
  users.forEach(async (user) => {
    if (user.deviceType === ANDROID) {
      sendWeeklyDebriefAndroidNotification(user);
    }
    if (user.deviceType === IOS) {
      sendWeeklyDebriefIOSNotification(user);
    }
  });
};

export default {
  sendNewArticleIOSNotification,
  sendNewArticleAndroidNotification,
  sendWeeklyDebriefIOSNotification,
  sendWeeklyDebriefAndroidNotification,
  notifyNewArticles,
  notifyWeeklyDebrief,
};
