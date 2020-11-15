import MockDate from 'mockdate';
import { compareTrendiness } from '../src/utils/compareTrendiness';

describe("testing compareTrendiness produces correct trending results", () => {
  beforeAll(() => {
    //Set present time to a fixed day to compute trendiness from
    MockDate.set('11-10-2020');
  });

  test('test correct trendiness order is returned', () => {
    const articles =
      [
        {
          id: 'one',
          title: 'Yi Hsin is still meeting with publications',
          publication: 'dailysun',
          articleURL: 'www.cuappdev.com/yi',
          imageURL: '',
          date: new Date('11-05-2020'),
          shoutouts: 10
        },
        {
          id: 'two',
          title: 'who will the next appdev team lead be',
          publication: 'dailysun',
          articleURL: 'www.cuappdev.com/lead',
          imageURL: '',
          date: new Date('11-08-2020'),
          shoutouts: 10
        },
        {
          id: 'three',
          title: 'why coffee is better than tea',
          publication: 'dailysun',
          articleURL: 'www.cuappdev.com/coffee',
          imageURL: '',
          date: new Date('11-07-2020'),
          shoutouts: 10
        },
        {
          id: 'four',
          title: 'orko 3410 ta office hours',
          publication: 'dailysun',
          articleURL: 'www.cuappdev.com/orko',
          imageURL: '',
          date: new Date('11-02-2020'),
          shoutouts: 20
        }
      ];

    const expectedOrder = [
      {
        id: 'two',
        title: 'who will the next appdev team lead be',
        publication: 'dailysun',
        articleURL: 'www.cuappdev.com/lead',
        imageURL: '',
        date: new Date('11-08-2020'),
        shoutouts: 10
      },
      {
        id: 'three',
        title: 'why coffee is better than tea',
        publication: 'dailysun',
        articleURL: 'www.cuappdev.com/coffee',
        imageURL: '',
        date: new Date('11-07-2020'),
        shoutouts: 10
      },
      {
        id: 'four',
        title: 'orko 3410 ta office hours',
        publication: 'dailysun',
        articleURL: 'www.cuappdev.com/orko',
        imageURL: '',
        date: new Date('11-02-2020'),
        shoutouts: 20
      },
      {
        id: 'one',
        title: 'Yi Hsin is still meeting with publications',
        publication: 'dailysun',
        articleURL: 'www.cuappdev.com/yi',
        imageURL: '',
        date: new Date('11-05-2020'),
        shoutouts: 10
      }
    ]

    const trendingArticles = articles.sort(compareTrendiness);

    expect(trendingArticles[0]).toMatchObject(expectedOrder[0]);
    expect(trendingArticles[1]).toMatchObject(expectedOrder[1]);
    expect(trendingArticles[2]).toMatchObject(expectedOrder[2]);
    expect(trendingArticles[3]).toMatchObject(expectedOrder[3]);
  });

  afterAll(() => {
    MockDate.reset();
  });
});
