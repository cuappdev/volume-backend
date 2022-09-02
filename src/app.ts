import 'reflect-metadata';
import cron from 'node-cron';
import admin from 'firebase-admin';
import Express from 'express';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import ArticleResolver from './resolvers/ArticleResolver';
import ArticleRepo from './repos/ArticleRepo';
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

  // Setup Android Admin
  if (process.env.NODE_ENV === 'production') {
    admin.initializeApp({
      credential: admin.credential.cert(process.env.FCM_AUTH_KEY_PATH),
    });
  }

  app.post('/collect', (req, res) => {
    const { articleIDs } = req.body;
    NotificationRepo.notify(articleIDs);
    res.json({ success: 'true' });
  });

  server.applyMiddleware({ app });

  async function setupTrendingArticleRefreshCron() {
    // Refresh trending articles 12 hours
    cron.schedule('0 */12 * * *', async () => {
      ArticleRepo.refreshTrendingArticles();
    });
  }

  setupTrendingArticleRefreshCron();

  ((port = process.env.APP_PORT) => {
    app.listen(port, () => console.log(`\n🔊 volume-backend running on port ${port}`));
  })();
};

main().catch((error) => {
  console.log(error);
});
