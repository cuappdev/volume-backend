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
  await PublicationRepo.addPublicationsToDB();

  const server = new ApolloServer({
    schema,
    playground: true,
    introspection: true,
  });
  const app = Express();

  app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
  });

  server.applyMiddleware({ app });

  ((port = process.env.APP_PORT) => {
    app.listen(port, () => console.log(`\n🔊 volume-backend running on port ${port}`));
  })();
};

main().catch((error) => {
  console.log(error);
});
