import { dbConnection, disconnectDB } from '../src/db/DBConnection';
import { ArticleModel } from '../src/entities/Article';

(async () => {
  await dbConnection();
  const articles = [
    {
      title: 'orko and tedi backend ',
      publicationID: '5fac75af7f68e1f1a4ae8b1b',
      artilceURL: 'www.orko.com',
      imageURL: 'www.orkopics.com',
      date: new Date('10-14-2020'),
      shoutouts: 0,
    },
    {
      title: 'appdev router sucks ---> let me tell you why',
      publicationID: '5fac75af7f68e1f1a4ae8b1b',
      articleURL: 'www.jack.com',
      imageURL: 'www.jack.com',
      date: new Date('10-15-2020'),
      shoutouts: 0,
    },
    {
      title: 'Cooking w Cornell Hotel School',
      publicationID: '5fac75af7f68e1f1a4ae8b1b',
      articleURL: 'www.new',
      imageURL: 'www.pic.com',
      date: new Date('10-16-2020'),
      shoutouts: 5,
    },
    {
      title: 'Conners 3 hats - what each of them mean',
      publicationID: '5fac75af7f68e1f1a4ae8b1b',
      articleURL: 'www.new.com',
      imageURL: 'www.pic.com',
      date: new Date('10-17-2020'),
      shoutouts: 0,
    },
    {
      title: 'We need better articles',
      publicationID: '5fac75af7f68e1f1a4ae8b1b',
      articleURL: 'www.newhat.com',
      imageURL: 'www.pic.com',
      date: new Date('10-21-2020'),
      shoutouts: 0,
    },
  ];

  try {
    for (const article of articles) {
      const { title, publicationID, articleURL, imageURL, date, shoutouts } = article;
      const newArticle = await ArticleModel.create({
        title,
        publicationID,
        date,
        imageURL,
        articleURL,
        shoutouts,
      });
      console.log(`Created article ${newArticle.title}`);
      console.log(`Created article ${newArticle.id}`);
      console.log(`Created article ${newArticle.id.toString()}`);
    }
  } catch (e) {
    console.log('Error creating articles.');
  }
  disconnectDB();
})().catch((e) => console.log(e));