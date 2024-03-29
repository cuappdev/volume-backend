import Express from 'express';
import admin from 'firebase-admin';
import cron from 'node-cron';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';

import { ApolloServer } from 'apollo-server-express';
import multer, { diskStorage } from 'multer';
import path from 'path';
import { dbConnection } from './db/DBConnection';
import { Flyer, FlyerModel } from './entities/Flyer';
import ArticleRepo from './repos/ArticleRepo';
import MagazineRepo from './repos/MagazineRepo';
import NotificationRepo from './repos/NotificationRepo';
import OrganizationRepo from './repos/OrganizationRepo';
import WeeklyDebriefRepo from './repos/WeeklyDebriefRepo';
import ArticleResolver from './resolvers/ArticleResolver';
import FlyerResolver from './resolvers/FlyerResolver';
import MagazineResolver from './resolvers/MagazineResolver';
import OrganizationResolver from './resolvers/OrganizationResolver';
import PublicationResolver from './resolvers/PublicationResolver';
import UserResolver from './resolvers/UserResolver';
import utils from './utils';
import FlyerRepo, { Actions } from './repos/FlyerRepo';

const main = async () => {
  const schema = await buildSchema({
    resolvers: [
      ArticleResolver,
      FlyerResolver,
      MagazineResolver,
      OrganizationResolver,
      PublicationResolver,
      UserResolver,
    ],
    emitSchemaFile: true,
    validate: false,
  });

  await dbConnection();

  const app = Express();

  app.use(Express.urlencoded({ extended: false }));
  app.use(Express.json({ limit: '50mb' }));

  const server = new ApolloServer({
    schema,
    playground: true,
    introspection: true,
  });

  app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
  });

  // Setup Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(process.env.FCM_AUTH_KEY_PATH),
  });

  app.post('/collect/articles/', (req, res) => {
    const { articleIDs } = req.body;
    NotificationRepo.notifyNewArticles(articleIDs);
    res.json({ success: 'true' });
  });

  app.post('/collect/magazines/', (req, res) => {
    const { magazineIDs } = req.body;
    NotificationRepo.notifyNewMagazines(magazineIDs);
    res.json({ success: 'true' });
  });

  app.post('/collect/flyers/', (req, res) => {
    const { flyerIDs } = req.body;
    NotificationRepo.notifyNewFlyers(flyerIDs);
    res.json({ success: 'true' });
  });

  const storage = diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
  });
  const upload = multer({ storage });

  /**
   * Route to create a flyer, uses form-data that should have request with key-value pairs
   * All of the following files are required:
   *  categorySlug
      endDate
      flyerURL
      location
      organizationID
      startDate
      title
   * There also must be a file with the key `image` which should be the image
      associated with the flyer. The image type must be png.
   */
  app.post('/flyers/', upload.single('image'), async (req, res) => {
    // Ensure there is an image file present
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const {
      categorySlug,
      endDate,
      flyerURL,
      location,
      organizationID,
      startDate,
      title,
    } = req.body;

    // Assert request body has required fields
    if (
      categorySlug == null ||
      endDate == null ||
      flyerURL == null ||
      location == null ||
      organizationID == null ||
      startDate == null ||
      title == null
    ) {
      return res.status(400).json({ error: 'Missing a required field' });
    }

    // Get the file from form-data and await the upload service
    const imageURL = await utils.uploadImage(req.file);
    console.log(`image url = ${imageURL}`);

    // Find the organization related to the request
    const organization = await OrganizationRepo.getOrganizationByID(organizationID);
    const organizationSlug = organization.slug;

    // Create the new flyer and put it on the app
    const newFlyer = Object.assign(new Flyer(), {
      categorySlug,
      endDate,
      flyerURL,
      imageURL,
      location,
      organization,
      organizationSlug,
      startDate,
      title,
    });
    const flyer = await FlyerModel.create(newFlyer);
    NotificationRepo.notifyFlyersForOrganizations(
      flyer.id,
      ' just added a new flyer!',
      Actions.Add,
    );
    return res.status(201).json(newFlyer);
  });

  /**
   * Route to edit a flyer, uses form-data.
   *
   * Requires `flyerID` field for which flyer we are editing.
   * Other flyer fields can optionally be sent in the form-data as key-value pairs.
   *
   * The file with the key `image` which should be the image associated with the flyer.
   * The image type must be png.
   */
  app.post('/flyers/edit/', upload.single('image'), async (req, res) => {
    const { categorySlug, endDate, flyerURL, location, startDate, title, flyerID } = req.body;

    // Assert request body has required fields
    if (!flyerID) {
      return res.status(400).json({ error: 'Missing a required flyerID field' });
    }

    const oldFlyer = await FlyerModel.findById(flyerID);
    if (!oldFlyer) {
      return res.status(400).json({ error: 'flyerID not associated with any flyers' });
    }

    // Get the file from form-data and await the upload service
    const imageURL = req.file ? await utils.uploadImage(req.file) : undefined;
    const flyer = await FlyerRepo.editFlyer(
      flyerID,
      categorySlug,
      endDate,
      flyerURL,
      imageURL,
      location,
      startDate,
      title,
    );

    let editedResponse = '';
    if ((endDate && location) || (location && startDate)) {
      // if endDate and location or startDate and location are nonempty, notification body would return date and location changed
      editedResponse = 'changed its date and location';
    } else if (endDate && startDate) {
      // if both endDate and startDate values changed, the notifcation body would just return that the event changed its date
      editedResponse = 'changed its date';
    } else if (endDate) {
      // if only the endDate changed for the event, then the notification body would print out specifically what the date was changed to
      const date = new Date(endDate);
      // the format for toDateString is Day of the Week Month Date Year ex: Tue Sep 05 2023
      editedResponse = `changed its end date to ${date.toDateString()}`;
    } else if (location) {
      // if only the location changed for the event, then the notification body would print out specifically what the location was changed to
      editedResponse = `changed its location to ${location}`;
    } else if (startDate) {
      // if only the startDate changed for the event, then the notification body would print out specifically what the date was changed to
      const date = new Date(startDate);
      // the format for toDateString is Day of the Week Month Date Year ex: Tue Sep 05 2023
      editedResponse = `changed its start date to ${date.toDateString()}`;
    }

    NotificationRepo.notifyFlyersForBookmarks(flyer.id, editedResponse, Actions.Edit);
    return res.status(201).json(await FlyerModel.findById(flyerID));
  });

  server.applyMiddleware({ app });

  async function setupWeeklyDebriefRefreshCron() {
    // Refresh weekly debriefs and sent notifications once a week
    cron.schedule('0 0 * * 0', async () => {
      const users = await WeeklyDebriefRepo.createWeeklyDebriefs();
      NotificationRepo.notifyWeeklyDebrief(users);
    });
  }

  async function setupTrendingArticleRefreshCron() {
    // Refresh trending articles, magazines, and flyers once
    ArticleRepo.refreshTrendingArticles();
    MagazineRepo.refreshFeaturedMagazines();
    // Refresh trending articles, magazines, and flyers every 12 hours
    cron.schedule('0 */12 * * *', async () => {
      ArticleRepo.refreshTrendingArticles();
      MagazineRepo.refreshFeaturedMagazines();
    });
  }

  setupWeeklyDebriefRefreshCron();
  setupTrendingArticleRefreshCron();

  ((port = process.env.APP_PORT) => {
    app.listen(port, () => console.log(`\n🔊 volume-backend running on port ${port}`));
  })();
};

main().catch((error) => {
  console.log(error);
});
