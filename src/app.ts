import 'reflect-metadata';

import { ApolloServer } from 'apollo-server-express';
import ArticleResolver from './resolvers/ArticleResolver';
import Express from 'express';
import PublicationRepo from './repos/PublicationRepo';
import PublicationResolver from './resolvers/PublicationResolver';
import { buildSchema } from 'type-graphql';
import { dbConnection } from './db/DBConnection';

const main = async () => {
  const schema = await buildSchema({
    resolvers: [ArticleResolver, PublicationResolver],
    emitSchemaFile: true,
    validate: false,
  });

  await dbConnection();

  //Prefill publication data
  PublicationRepo.addPublicationsToDB();

  const server = new ApolloServer({ schema, playground: true });
  const app = Express();

  app.get('/', (req, res) => {
    res.send('Welcome to volume-backend.');
  });

  server.applyMiddleware({ app });

  ((port = process.env.APP_PORT) => {
    app.listen(port, () => console.log(`🔊 volume-backend running on port ${port}`));
  })();
};

main().catch((error) => {
  console.log(error);
});
