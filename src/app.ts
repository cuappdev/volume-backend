import 'reflect-metadata';
import cron from 'node-cron';
import admin from 'firebase-admin';
import Express from 'express';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import ArticleResolver from './resolvers/ArticleResolver';
import ArticleRepo from './repos/ArticleRepo';
import PublicationRepo from './repos/PublicationRepo';
import PublicationResolver from './resolvers/PublicationResolver';
import NotificationRepo from './repos/NotificationRepo';
import UserResolver from './resolvers/UserResolver';
import { dbConnection } from './db/DBConnection';

const main = async () => {
  const schema = await buildSchema({
    resolvers: [ArticleResolver, PublicationResolver, UserResolver],
    emitSchemaFile: true,
    validate: false,
  });

  await dbConnection();

  // Prefill publication data
  await PublicationRepo.addPublicationsToDB();

  const server = new ApolloServer({
    schema,
    playground: true,
    introspection: true,
  });
  const app = Express();

  app.use(Express.json());
  app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
  });

  // SETUP FOR NOTIFICATIONS
  // // Setup IOS Admin
  // console.log('IOS Setting up Admin...');
  // const options = {
  //   token: {
  //     key: process.env.APNS_AUTH_KEY_PATH,
  //     keyId: process.env.APNS_KEY_ID,
  //     teamId: process.env.APNS_TEAM_ID,
  //   },
  //   production: false, // send to dev server for testing
  // };
  // export const apnProvider = new apn.Provider(options);
  // console.log('IOS Admin set up...');
  // Setup Android Admin
  console.log('ANDROID Setting up Admin...');
  console.log(process.env.FCM_AUTH_KEY_PATH);
  admin.initializeApp({
    credential: admin.credential.cert(process.env.FCM_AUTH_KEY_PATH),
    databaseURL: 'https://sample-project-e1a84.firebaseio.com',
  });
  console.log('ANDROID Admin set up...');

  app.post('/collect', (req, res) => {
    const { articleIDs } = req.body;
    console.log(articleIDs);
    console.log('Sending Notifications:');
    NotificationRepo.notify(articleIDs);
    res.json({ success: 'true' });
  });

  server.applyMiddleware({ app });

  async function setupArticleRefreshCron() {
    // Refresh articles every 12 hours
    cron.schedule('0 */12 * * *', async () => {
      ArticleRepo.refreshFeed();
    });
  }

  async function setupTrendingArticleRefreshCron() {
    // Refresh trending articles 12 hours
    cron.schedule('0 */12 * * *', async () => {
      ArticleRepo.refreshTrendingArticles();
    });
  }

  setupArticleRefreshCron();
  setupTrendingArticleRefreshCron();

  ((port = process.env.APP_PORT) => {
    app.listen(port, () => console.log(`\n🔊 volume-backend running on port ${port}`));
  })();
};

main().catch((error) => {
  console.log(error);
});
