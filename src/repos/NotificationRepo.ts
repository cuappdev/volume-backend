import * as admin from 'firebase-admin';
import { User } from '../entities/User';
import ArticleRepo from './ArticleRepo';
import FlyerRepo from './FlyerRepo';
import MagazineRepo from './MagazineRepo';
import OrganizationRepo from './OrganizationRepo';
import PublicationRepo from './PublicationRepo';
import UserRepo from './UserRepo';

/**
 * General purpose function for sending notifications.
 * @param user User object
 * @param notifTitle Notification title
 * @param notifBody Notificiation body
 * @param uniqueData Any unique metadata to be sent in notif beyond uuid and notif type
 * @param notifType Notification type (ex. 'new_article')
 */
const sendNotif = async (
  user: User,
  notifTitle: string,
  notifBody: string,
  uniqueData: Record<string, string>,
  notifType: string,
) => {
  const { deviceToken } = user;

  const notifData = {
    title: notifTitle,
    body: notifBody,
  };

  const metaData = {
    userID: user.uuid,
    ...uniqueData,
    notificationType: notifType,
  };

  let message = {};

  // Determine notif format based on device type
  if (user.deviceType === 'IOS') {
    message = {
      notification: notifData,
      data: metaData,
    };
  } else {
    message = {
      data: {
        ...notifData,
        ...metaData,
      },
    };
  }

  const options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24,
  };

  // Send notification to FCM servers
  if (deviceToken !== '') {
    admin
      .messaging()
      .sendToDevice(deviceToken, message, options)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
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
      const notifTitle = publication.name;
      const notifBody = article.title;

      const uniqueData = {
        articleID: article.id,
        articleURL: article.articleURL,
      };

      await sendNotif(follower, notifTitle, notifBody, uniqueData, 'new_article');
    });
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
      const notifTitle = publication.name;
      const notifBody = magazine.title;

      const uniqueData = {
        magazineID: magazine.id,
        magazinePDF: magazine.pdfURL,
      };

      await sendNotif(follower, notifTitle, notifBody, uniqueData, 'new_magazine');
    });
  });
};

/**
 * Send notifications for new flyers posted by organizations.
 */
const notifyNewFlyers = async (flyerIDs: string[]): Promise<void> => {
  flyerIDs.forEach(async (f) => {
    const flyer = await FlyerRepo.getFlyerByID(f); // eslint-disable-line
    const organization = await OrganizationRepo.getOrganizationBySlug(flyer.organizationSlug);
    const followers = await UserRepo.getUsersFollowingOrganization(flyer.organizationSlug);
    followers.forEach(async (follower) => {
      const notifTitle = organization.name;
      const notifBody = flyer.title;

      const uniqueData = {
        flyerID: flyer.id,
        flyerURL: flyer.flyerURL,
      };

      await sendNotif(follower, notifTitle, notifBody, uniqueData, 'new_flyer');
    });
  });
};

/**
 * Send notifications for weekly debrief release.
 */
const notifyWeeklyDebrief = async (users: User[]): Promise<void> => {
  users.forEach(async (user) => {
    const notifTitle = 'Your Weekly Debrief is Ready';
    const notifBody = 'Click to check out whats new on Volume this week!';

    await sendNotif(user, notifTitle, notifBody, {}, 'weekly_debrief');
  });
};

export default {
  notifyNewArticles,
  notifyNewFlyers,
  notifyNewMagazines,
  notifyWeeklyDebrief,
};
