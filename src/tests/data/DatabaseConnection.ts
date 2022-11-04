import mongoose from 'mongoose';

let database: mongoose.Connection;

/* Creates a connection to database. */
export const dbConnection = async (): Promise<mongoose.Connection> => {
  if (database) {
    return database;
  }

  // create mongoose connection
  if (process.env.MONGO_TESTING_ADDRESS) {
    mongoose.connect(process.env.MONGO_TESTING_ADDRESS, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  }

  database = mongoose.connection;

  /* eslint-disable no-console */
  database.once('open', async () => {
    console.log('Connected to test database.');
  });

  database.on('error', async () => {
    console.log('Error connecting to test database.');
  });
  /* eslint-enable no-console */

  return database;
};

/* Disconnects from database. */
export const disconnectDB = (): void => {
  if (!database) {
    return;
  }
  mongoose.disconnect();
};
