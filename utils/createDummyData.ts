import { ArticleModel } from '../src/entities/Article';

export const createDummyData = async () => {
  const articles = [
    {
      title: 'orko and tedi backend ',
      publication: 'g',
      artilceUrl: 'www.orko.com',
      imageUrl: 'www.orkopics.com',
      date: '10-14-2020',
      likes: 0,
    },
    {
      title: 'appdev router---> sucks, let me tell you why',
      publication: 'g',
      articleUrl: 'www.jack.com',
      imageUrl: 'www.jack.com',
      date: '10-14-2020',
      likes: 0,
    },
    {
      title: 'Bruh',
      publication: 'g',
      articleUrl: 'www.ne',
      imageUrl: 'www.pic',
      date: '10-15-2020',
      likes: 0,
    },
    {
      title: 'Bruh',
      publication: 'g',
      articleUrl: 'www.ne',
      imageUrl: 'www.pic',
      date: '10-16-2020',
      likes: 0,
    },
    {
      title: 'Bruh',
      publication: 'g',
      articleUrl: 'www.ne',
      imageUrl: 'www.pic',
      date: '10-21-2020',
      likes: 0,
    },
  ];

  try {
    for (const article of articles) {
      const {
        title, publication, articleUrl, imageUrl, date, likes,
      } = article;
      await ArticleModel.create({
        title,
        publication,
        date,
        imageURL: imageUrl,
        articleURL: articleUrl,
        likes,
      });
      console.log(`Created article ${article.title}`);
    }
  } catch (e) {
    console.log(e, 'Error creating articles');
  }
};
