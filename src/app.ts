import Express from 'express';
import admin from 'firebase-admin';
import cron from 'node-cron';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';

import { ApolloServer } from 'apollo-server-express';
import multer from 'multer';
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

  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  app.post('/flyers/', upload.single('file'), async (req, res) => {
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
    const imageB64 = req.file.buffer.toString('base64');
    const imageURL = await utils.uploadImage(imageB64);

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
    await FlyerModel.create(newFlyer);
    return res.status(201).json(newFlyer);
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
