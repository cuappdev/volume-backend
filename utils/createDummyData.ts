import { ArticleModel } from '../src/entities/Article';

export const createDummyData = async () => {
  const articles = [
    {
      title: 'orko and tedi backend ',
      publication: 'g',
      articleURL: 'www.orko.com',
      imageURL: 'www.orkopics.com',
      date: '10-14-2020',
      likes: 0,
    },
    {
      title: 'appdev router---> sucks, let me tell you why',
      publication: 'g',
      articleURL: 'www.jack.com',
      imageURL: 'www.jack.com',
      date: '10-14-2020',
      likes: 0,
    },
    {
      title: 'Bruh',
      publication: 'g',
      articleURL: 'www.ne',
      imageURL: 'www.pic',
      date: '10-15-2020',
      likes: 0,
    },
    {
      title: 'Bruh',
      publication: 'g',
      articleURL: 'www.ne',
      imageURL: 'www.pic',
      date: '10-16-2020',
      likes: 0,
    },
    {
      title: 'Bruh',
      publication: 'g',
      articleURL: 'www.ne',
      imageURL: 'www.pic',
      date: '10-21-2020',
      likes: 0,
    },
  ];

  try {
    for (const article of articles) {
      const {
        title, publication, articleURL, imageURL, date, likes,
      } = article;
      await ArticleModel.create({
        title,
        publication,
        date,
        imageURL: imageURL,
        articleURL: articleURL,
        likes,
      });
      console.log(`Created article ${article.title}`);
    }
  } catch (e) {
    console.log(e, 'Error creating articles');
  }
};
