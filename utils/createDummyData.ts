import { ObjectId } from 'mongodb';
import { dbConnection, disconnectDB } from '../src/db/DBConnection';
import { ArticleModel, Article } from '../src/entities/Article';

export const getDummyArticles = (): Article[] => {
  return [
    {
      id: new ObjectId().toString(),
      title: 'orko and tedi backend ',
      publication: null,
      articleURL: 'www.orko.com',
      imageURL: 'www.orkopics.com',
      date: new Date('11-05-2020'),
      shoutouts: 10,
    },
    {
      id: new ObjectId().toString(),
      title: 'appdev router sucks ---> let me tell you why',
      publication: null,
      articleURL: 'www.jack.com',
      imageURL: 'www.jack.com',
      date: new Date('11-08-2020'),
      shoutouts: 10,
    },
    {
      id: new ObjectId().toString(),
      title: 'Cooking w Cornell Hotel School',
      publication: null,
      articleURL: 'www.new.com',
      imageURL: 'www.pic.com',
      date: new Date('11-07-2020'),
      shoutouts: 10,
    },
    {
      id: new ObjectId().toString(),
      title: 'Conners 3 hats - what each of them mean',
      publication: null,
      articleURL: 'www.newweb.com',
      imageURL: 'www.pic.com',
      date: new Date('11-02-2020'),
      shoutouts: 20,
    }
  ];
}

// Insert dummy articles into database for testing
(async () => {
  await dbConnection();
  let articles = getDummyArticles();

  try {
    articles = await ArticleModel.insertMany(articles, { ordered: false });
  } catch (e) {
    articles = e.insertedDocs;
  }

  disconnectDB();
})().catch((e) => console.log(e));
