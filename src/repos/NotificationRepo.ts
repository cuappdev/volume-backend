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
const sendIOSNotification = async (
  user: User,
  article: Article,
  publication: Publication,
): Promise<void> => {
  // console.log('Sending IOS Notification...');
  // Get device token of user
  const { deviceToken } = user;

  // Setup IOS Admin
  // console.log('IOS Setting up Admin...');
  const options = {
    token: {
      key: process.env.APNS_TOKEN_PATH,
      keyId: process.env.APNS_KEY_ID,
      teamId: process.env.APNS_TEAM_ID,
    },
    production: false,
  };
  const apnProvider = new apn.Provider(options);
  // console.log('IOS Admin set up...');

  // TODO: ADJUST ALERT TO INCLUDE METADATA
  const note = new apn.Notification({
    alert: {
      title: publication.name,
      body: article.title,
    },
  });


  // TODO: ADJUST SETTINGS
  note.expiry = Math.floor(Date.now() / 1000) + 3600;
  note.badge = 3;
  note.sound = 'ping.aiff';
  note.payload = { messageFrom: 'Tedi Mitiku' };
  note.topic = process.env.APNS_BUNDLE_ID;

  // console.log('IOS About to send payload');
  // Send notification to APN servers
  apnProvider.send(note, deviceToken).then((result) => {
    console.log(result.sent);
    console.log(result.failed);
  });
  // console.log('IOS Payload sent');
};

/**
 * Send Android push notification to {userID} about an {articleID} that {publicationSlug} posted.
 */
const sendAndroidNotification = async (
  user: User,
  article: Article,
  publication: Publication,
): Promise<void> => {
  // Get device token of user
  // console.log('Sending Android Notification...');
  const { deviceToken } = user;

  const notifTitle = `New article form ${publication.name}`;
  const notifBody = `Read ${article.title}`;

  const message = {
    notification: {
      title: notifTitle,
      body: notifBody,
    },
    data: {
      user: user.uuid,
      article: article.id,
      publication: publication.name,
    },
  };

  // TODO: Adjust settings
  const options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24,
  };

  // console.log('ANDROID About to send payload');
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
  // console.log('ANDROID Payload sent');
};

/**
 * Send notifications for new articles have been posted by publications.
 */
const notify = async (articleIDs: string[]): Promise<void> => {
  // Send notifications to everyone following the publication associated with this article
  articleIDs.forEach(async (a) => {
    const article = await ArticleRepo.getArticleByID(a); // eslint-disable-line
    const publication = await PublicationRepo.getPublicationBySlug(article.publicationSlug);
    // console.log('Article to nofity:');
    // console.log(article);
    // console.log('Publication who made article:');
    // console.log(publication);
    const followers = await UserRepo.getUsersFollowingPublication(article.publicationSlug);
    // console.log('Followers of publication:');
    followers.forEach(async (follower) => {
      if (follower.deviceType === ANDROID) {
        // console.log(follower);
        sendAndroidNotification(follower, article, publication);
      }
      if (follower.deviceType === IOS) {
        // console.log(follower);
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
