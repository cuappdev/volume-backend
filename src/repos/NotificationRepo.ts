import apn from 'apn';
import * as admin from 'firebase-admin';
import UserRepo from './UserRepo';
import PublicationRepo from './PublicationRepo';
import ArticleRepo from './ArticleRepo';
import { ANDROID, IOS } from '../common/constants';

/**
 * Send IOS push notification when a publications that a user follows posts a new article.
 * @param userID
 * @param articleID
 * @param publicationSlug
 */
const sendIOSNotification = async (
  uuid: string,
  articleID: string,
  publicationSlug: string,
): Promise<void> => {
  // Get device token of user
  const user = await UserRepo.getUserByUUID(uuid);
  const { deviceToken } = user;

  // Get information about article and publication
  const article = await ArticleRepo.getArticleByID(articleID);
  const publication = await PublicationRepo.getPublicationBySlug(publicationSlug);

  // Setup notification information
  const options = {
    token: {
      key: process.env.APNS_AUTH_KEY_PATH,
      keyId: process.env.APNS_KEY_ID,
      teamId: process.env.APNS_TEAM_ID,
    },
    production: false,
  };

  const apnProvider = new apn.Provider(options);

  const note = new apn.Notification({
    alert: {
      title: publication.name,
      body: article.title,
    },
  });

  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
  note.badge = 3;
  note.sound = 'ping.aiff';
  note.payload = { messageFrom: 'John Appleseed' };
  note.topic = process.env.APNS_BUNDLE_ID;

  // Send notification to APN servers
  apnProvider.send(note, deviceToken).then((result) => {
    console.log(result.sent);
    console.log(result.failed);
  });
};

/**
 * Send Android push notification when a publications that a user follows posts a new article.
 * @param uuid
 * @param articleID
 * @param publicationSlug
 */
const sendAndroidNotification = async (
  uuid: string,
  articleID: string,
  publicationSlug: string,
): Promise<void> => {
  // Get device token of user
  const user = await UserRepo.getUserByUUID(uuid);
  const { deviceToken } = user;

  // Get information about article and publication
  const article = await ArticleRepo.getArticleByID(articleID);
  const publication = await PublicationRepo.getPublicationBySlug(publicationSlug);

  // Setup notification information
  admin.initializeApp({
    credential: admin.credential.cert(process.env.FCM_AUTH_KEY_PATH),
    databaseURL: 'https://sample-project-e1a84.firebaseio.com',
  });

  const message = {
    notification: {
      title: publication.name,
      body: article.title,
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
  // Send notifications to everyone following the publication associated with this article
  articleIDs.forEach(async (a) => {
    const article = await ArticleRepo.getArticleByID(a); // eslint-disable-line
    const followers = await UserRepo.getUsersFollowingPublication(article.publicationSlug);
    followers.forEach(async (follower) => {
      if (follower.notification === ANDROID)
        sendIOSNotification(follower.uuid, article.id, article.publicationSlug);
      if (follower.notification === IOS)
        sendAndroidNotification(follower.uuid, article.id, article.publicationSlug);
    });
  });
};

export default {
  sendIOSNotification,
  sendAndroidNotification,
  notify,
};
