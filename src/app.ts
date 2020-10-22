import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import dotenv from 'dotenv';
import Express from 'express';
import 'reflect-metadata';
import { dbConnection } from './db/DBConnection';

// resolvers
import { ArticleResolver } from './resolvers/ArticleResolver';

// load the environment variables from the .env file
dotenv.config({
    path: '.env',
});

const main = async () => {
    const schema = await buildSchema({
        resolvers: [ ArticleResolver ],
        emitSchemaFile: true,
        validate: false,
    });

    await dbConnection();

    const server = new ApolloServer({schema});
    const app = Express();

    server.applyMiddleware({app});

    (( port = process.env.APP_PORT, addr = process.env.SERVER_ADDRESS ) => {
        app.listen( port, () =>
            console.log(`volume-backend ready and listening at ${addr}:${port}${server.graphqlPath}`) 
        );
    })();
   
    
};

main().catch((error)=>{
    console.log(error);
});