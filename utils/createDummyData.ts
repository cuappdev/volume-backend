import { ArticleModel } from '../src/entities/Article';
import { dbConnection, disconnectDB } from '../src/db/DBConnection';

(async () => {
  await dbConnection();
  const articles = [
    {
      title: 'orko and tedi backend ',
      publication: 'dailysun',
      artilceUrl: 'www.orko.com',
      imageUrl: 'www.orkopics.com',
      date: new Date('10-14-2020'),
      likes: 0,
    },
    {
      title: 'appdev router sucks ---> let me tell you why',
      publication: 'nooz',
      articleUrl: 'www.jack.com',
      imageUrl: 'www.jack.com',
      date: new Date('10-15-2020'),
      likes: 0,
    },
    {
      title: 'Cooking w Cornell Hotel School',
      publication: 'creme',
      articleUrl: 'www.ne',
      imageUrl: 'www.pic',
      date: new Date('10-16-2020'),
      likes: 5,
    },
    {
      title: 'Conners 3 hats - what each of them mean',
      publication: 'slope',
      articleUrl: 'www.ne',
      imageUrl: 'www.pic',
      date: new Date('10-17-2020'),
      likes: 0,
    },
    {
      title: 'We need better articles',
      publication: 'advocate',
      articleUrl: 'www.ne',
      imageUrl: 'www.pic',
      date: new Date('10-21-2020'),
      likes: 0,
    },
  ];

  try {
    for (const article of articles) {
      const {
        title, publication, articleUrl, imageUrl, date, likes,
      } = article;
      const newArticle = await ArticleModel.create({
        title,
        publication,
        date,
        imageURL: imageUrl,
        articleURL: articleUrl,
        likes,
      });
      console.log(`Created article ${newArticle.title}`);
      console.log(`Created article ${newArticle.id}`);
      console.log(`Created article ${newArticle.id.toString()}`);
    }
  } catch (e) {
    console.log(e, 'Error creating articles');
  }
  disconnectDB();
})().catch((e) => console.log(e));
