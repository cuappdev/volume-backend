/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable dot-notation */
import admin from 'firebase-admin';
import { dbConnection, disconnectDB } from './data/TestingDBConnection';

const fetch = require('node-fetch-commonjs');

beforeAll(async () => {
  await dbConnection;
  admin.initializeApp({
    credential: admin.credential.cert(process.env.FCM_AUTH_KEY_PATH),
  });
});
afterAll(async () => {
  await disconnectDB();
});

test('Test getAllArticles', () => {
  const getAllArticles = {
    getAllArticles: [
      {
        publicationSlug: 'nooz',
      },
    ],
  };

  // The URL of the GraphQL API server
  return (
    fetch(`${process.env.SERVER_ADDRESS}:${process.env.APP_PORT}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // The query we are sending to the GraphQL API
      body: JSON.stringify({
        query: `query {
				getAllArticles(limit: 1) {
					publicationSlug
				}
			}`,
      }),
    })
      .then(async (res) => res.json())
      // The test condition itself
      .then((res) => expect(res['data']).toStrictEqual(getAllArticles))
  );
});
export {};
