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

  const server = new ApolloServer({ schema });
  const app = Express();

  server.applyMiddleware({ app });

  ((port = process.env.APP_PORT, addr = process.env.SERVER_ADDRESS) => {
    app.listen(port, () =>
      process.env.NODE_ENV == 'production'
        ? console.log('volume-backend ready at http://volume-backend.cornellappdev.com')
        : console.log(`volume-backend ready and listening at ${addr}:${port}${server.graphqlPath}`),
    );
  })();
};

main().catch((error) => {
  console.log(error);
});
