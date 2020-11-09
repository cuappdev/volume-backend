import 'reflect-metadata';
import Express from 'express';
import dotenv from 'dotenv';
import { ApolloServer } from 'apollo-server-express';
import ArticleResolver from './resolvers/ArticleResolver';
import PublicationResolver from './resolvers/PublicationResolver';
import { buildSchema } from 'type-graphql';
import { dbConnection } from './db/DBConnection';
import publicationsJSON from '../publications.json';
import { PublicationModel } from '../src/entities/Publication';

// load the environment variables from the .env file
dotenv.config({
  path: '.env',
});

const main = async () => {
  const schema = await buildSchema({
    resolvers: [ArticleResolver, PublicationResolver],
    emitSchemaFile: true,
    validate: false,
  });

  await dbConnection();

  // Prefill publication data into database
  const publicationsDB = publicationsJSON.publications;
  publicationsDB.map(async ({ slug, bio, rssURL, imageURL, name, websiteURL, rssName }) => {
    await PublicationModel.create({
      slug,
      bio,
      rssURL,
      imageURL,
      name,
      websiteURL,
      rssName,
      shoutouts: 0,
    }).catch((e) => {
      console.log('Publication already exists in database.');
    });
  });

  const server = new ApolloServer({ schema });
  const app = Express();

  server.applyMiddleware({ app });

  ((port = 3000, addr = 'https://localhost') => {
    app.listen(port, () =>
      console.log(`volume-backend ready and listening at ${addr}:${port}${server.graphqlPath}`),
    );
  })();
};

main().catch((error) => {
  console.log(error);
});
