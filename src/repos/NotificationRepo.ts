import apn from 'apn';
import * as admin from 'firebase-admin';
import { User } from '../entities/User';
import { Publication } from '../entities/Publication';
import { Article } from '../entities/Article';
import UserRepo from './UserRepo';
import PublicationRepo from './PublicationRepo';
import ArticleRepo from './ArticleRepo';
import { ANDROID, IOS } from '../common/constants';

// WARNING: TODO CLEAN UP DOCUMENTATION

/**
 * Send IOS push notification when a publications that a user follows posts a new article.
 * @param userID
 * @param articleID
 * @param publicationSlug
 */
const sendIOSNotification = async (
  user: User,
  article: Article,
  publication: Publication,
): Promise<void> => {
  console.log('Sending IOS Notification...');
  // Get device token of user
  const { deviceToken } = user;

  // Setup IOS Admin
  console.log('IOS Setting up Admin...');
  const options = {
    cert: process.env.APNS_CERT_PATH,
    production: false, // send to dev server for testing
  };
  const apnProvider = new apn.Provider(options);
  console.log('IOS Admin set up...');

  const note = new apn.Notification({
    alert: {
      title: publication.name,
      body: article.title,
    },
  });

  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
  note.badge = 3;
  note.sound = 'ping.aiff';
  note.payload = { messageFrom: 'Tedi Mitiku' };
  note.topic = process.env.APNS_BUNDLE_ID;

  console.log('IOS About to send payload');
  // Send notification to APN servers
  apnProvider.send(note, deviceToken).then((result) => {
    console.log(result.sent);
    console.log(result.failed);
  });
  console.log('IOS Payload sent');
};

/**
 * Send Android push notification when a publications that a user follows posts a new article.
 * @param uuid
 * @param articleID
 * @param publicationSlug
 */
const sendAndroidNotification = async (
  user: User,
  article: Article,
  publication: Publication,
): Promise<void> => {
  // Get device token of user
  console.log('Sending Android Notification...');
  const { deviceToken } = user;

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

  console.log('ANDROID About to send payload');
  // Send notification to FCM servers
  admin
    .messaging()
    .sendToDevice(deviceToken, message, options)
    .then((response) => {
      console.log(response);
      console.log(response.results[0].error);
    })
    .catch((error) => {
      console.log(error);
    });
  console.log('ANDROID Payload sent');
};

/**
 * Send notifications for new articles have been posted by publications.
 */
const notify = async (articleIDs: string[]): Promise<void> => {
  // Send notifications to everyone following the publication associated with this article
  articleIDs.forEach(async (a) => {
    const article = await ArticleRepo.getArticleByID(a); // eslint-disable-line
    const publication = await PublicationRepo.getPublicationBySlug(article.publicationSlug); // eslint-disable-line
    console.log('Article to nofity:');
    console.log(article);
    console.log('Publication who made article:');
    console.log(publication);
    const followers = await UserRepo.getUsersFollowingPublication(article.publicationSlug);
    console.log('Followers of publication:');
    followers.forEach(async (follower) => {
      console.log(follower);
      if (follower.deviceType === ANDROID) {
        sendAndroidNotification(follower, article, publication);
      }
      if (follower.deviceType === IOS) {
        sendIOSNotification(follower, article, publication);
      }
    });
  });
};

export default {
  sendIOSNotification,
  sendAndroidNotification,
  notify,
};
