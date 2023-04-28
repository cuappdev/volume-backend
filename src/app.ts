import 'reflect-metadata';
import cron from 'node-cron';
import admin from 'firebase-admin';
import Express from 'express';
import { buildSchema } from 'type-graphql';

import { ApolloServer } from 'apollo-server-express';
import ArticleResolver from './resolvers/ArticleResolver';
import ArticleRepo from './repos/ArticleRepo';
import { dbConnection } from './db/DBConnection';
import FlyerRepo from './repos/FlyerRepo';
import FlyerResolver from './resolvers/FlyerResolver';
import MagazineRepo from './repos/MagazineRepo';
import MagazineResolver from './resolvers/MagazineResolver';
import NotificationRepo from './repos/NotificationRepo';
import OrganizationResolver from './resolvers/OrganizationResolver';
import PublicationResolver from './resolvers/PublicationResolver';
import UserResolver from './resolvers/UserResolver';
import WeeklyDebriefRepo from './repos/WeeklyDebriefRepo';

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
  app.use(Express.json());

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
    FlyerRepo.refreshTrendingFlyers();
    // Refresh trending articles, magazines, and flyers eveyr 12 hours
    cron.schedule('0 */12 * * *', async () => {
      ArticleRepo.refreshTrendingArticles();
      MagazineRepo.refreshFeaturedMagazines();
      FlyerRepo.refreshTrendingFlyers();
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
