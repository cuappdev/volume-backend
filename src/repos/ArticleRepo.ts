import Filter from 'bad-words';
import { ObjectId } from 'mongodb';
import { Article, ArticleModel } from '../entities/Article';
import { DEFAULT_LIMIT, MAX_NUM_DAYS_OF_TRENDING_ARTICLES } from '../common/constants';

const getArticleByID = async (id: string): Promise<Article> => {
  return ArticleModel.findById(new ObjectId(id));
};

const getArticlesByIDs = async (ids: string[]): Promise<Article[]> => {
  return Promise.all(ids.map((id) => ArticleModel.findById(new ObjectId(id)))).then((articles) => {
    // Filter out all null values that were returned by ObjectIds not associated
    // with articles in database
    return articles.filter((article) => article !== null);
  });
};

const getAllArticles = async (limit = DEFAULT_LIMIT): Promise<Article[]> => {
  return ArticleModel.find({}).limit(limit);
};

const getArticlesByPublicationID = async (publicationID: string): Promise<Article[]> => {
  return ArticleModel.find({ 'publication.id': publicationID });
};

const getArticlesByPublicationIDs = async (publicationIDs: string[]): Promise<Article[]> => {
  const uniquePubIDs = [...new Set(publicationIDs)];
  const articles = await Promise.all(
    uniquePubIDs.map(async (pubID) => {
      return getArticlesByPublicationID(pubID);
    }),
  );
  return articles.flat();
};

const getArticlesAfterDate = async (since: string, limit = DEFAULT_LIMIT): Promise<Article[]> => {
  return (
    ArticleModel.find({
      // Get all articles after or on the desired date
      date: { $gte: new Date(new Date(since).setHours(0, 0, 0)) },
    })
      // Sort dates in order of most recent to least
      .sort({ date: 'desc' })
      .limit(limit)
  );
};

/**
 * Computes and returns the trending articles in the database.
 *
 * @function
 * @param {number} limit - number of articles to retrieve.
 */
const getTrendingArticles = async (limit = DEFAULT_LIMIT): Promise<Article[]> => {
  const articles = await ArticleModel.find({ isTrending: true }).exec();
  return articles.slice(0, limit);
};

/**
 * Refreshes trending articles.
 */
const refreshTrendingArticles = async (): Promise<Article[]> => {
  // Set previous trending articles to not trending
  const oldTrendingArticles = await ArticleModel.find({ isTrending: true }).exec();
  oldTrendingArticles.forEach(async (a) => {
    const article = await ArticleModel.findById(new ObjectId(a._id)); // eslint-disable-line
    article.isTrending = false;
    await article.save();
  });

  // Get new trending articles
  const articles = await ArticleModel.aggregate()
    // Get a sample of random articles
    .sample(100)
    // Get articles after 30 days ago
    .match({
      date: {
        $gte: new Date(
          new Date().setDate(new Date().getDate() - MAX_NUM_DAYS_OF_TRENDING_ARTICLES),
        ),
      },
    });

  articles.forEach(async (a) => {
    const article = await ArticleModel.findById(new ObjectId(a._id)); // eslint-disable-line
    article.isTrending = true;
    await article.save();
  });

  return articles;
};

/**
 * Increments number of shoutouts on an article and publication by one.
 * @function
 * @param {string} id - string representing the unique Object Id of an article.
 */
const incrementShoutouts = async (id: string): Promise<Article> => {
  const article = await ArticleModel.findById(new ObjectId(id));
  if (article !== null) {
    article.shoutouts += 1;
    return article.save();
  }
  return article;
};

/**
 * Checks if an article's title contains profanity.
 * @function
 * @param {string} title - article title.
 */
const checkProfanity = async (title: string): Promise<boolean> => {
  const filter = new Filter();
  return filter.isProfane(title);
};

export default {
  checkProfanity,
  getAllArticles,
  getArticleByID,
  getArticlesAfterDate,
  getArticlesByIDs,
  getArticlesByPublicationID,
  getArticlesByPublicationIDs,
  getTrendingArticles,
  incrementShoutouts,
  refreshTrendingArticles,
};
