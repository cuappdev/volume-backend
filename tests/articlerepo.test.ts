import MockDate from 'mockdate';
import { compareTrendiness } from '../src/repos/ArticleRepo';
import { getDummyArticles } from '../utils/createDummyData';

describe("testing getTrendingArticles query", () => {
  beforeAll(() => {
    // Set present time to a fixed day to compute trendiness from
    MockDate.set('11-10-2020');
  });

  test('test correct trendiness order is returned', () => {
    const articles = getDummyArticles();
    const trendingArticles = articles.sort(compareTrendiness);

    expect(trendingArticles[0].title).toBe('appdev router sucks ---> let me tell you why');
    expect(trendingArticles[1].title).toBe('Cooking w Cornell Hotel School');
    expect(trendingArticles[2].title).toBe('Conners 3 hats - what each of them mean');
    expect(trendingArticles[3].title).toBe('orko and tedi backend ');
  });

  afterAll(() => {
    MockDate.reset();
  });
});
