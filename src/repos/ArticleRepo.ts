import { ObjectId } from 'mongodb';
import { Article, ArticleModel } from '../entities/Article';
import Constants from '../common/constants';
import getRecentArticles from '../db/rss-parser';
import { PublicationModel } from '../entities/Publication';

const getArticleByID = async (id: string): Promise<Article> => {
  return ArticleModel.findById(new ObjectId(id));
};

const getArticlesByIDs = async (ids: string[]): Promise<Article[]> => {
  return Promise.all(ids.map((id) => ArticleModel.findById(new ObjectId(id)))).then((articles) => {
    return articles[0] != null ? articles : [];
  });
};

const getAllArticles = async (limit = Constants.DEFAULT_LIMIT): Promise<Article[]> => {
  return ArticleModel.find({}).limit(limit);
};

const getArticlesByPublication = async (publicationID: string): Promise<Article[]> => {
  const publication = await PublicationModel.findById(new ObjectId(publicationID));
  return ArticleModel.find({ publicationSlug: publication.slug });
};

const getArticlesAfterDate = async (
  since: string,
  limit = Constants.DEFAULT_LIMIT,
): Promise<Article[]> => {
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
 * @param {string} since - retrieve articles after this date.
 */
const getTrendingArticles = async (
  since: string,
  limit = Constants.DEFAULT_LIMIT,
): Promise<Article[]> => {
  const trendingArticles = await ArticleModel.find({
    date: { $gte: new Date(new Date(since).setHours(0, 0, 0)) },
  })
    .sort({ trendiness: 'desc' })
    .exec();
  return trendingArticles.slice(0, limit);
};

/**
 * Returns most recent articles published.
 */
const refreshFeed = async (): Promise<Article[]> => {
  let articles = await getRecentArticles();
  try {
    // Attempt to insert articles while validating a duplicate isn't inserted
    articles = await ArticleModel.insertMany(articles, { ordered: false });
  } catch (e) {
    // Set articles to all the ones that would have been inserted aka. weren't duplicates
    articles = e.insertedDocs;
  }
  return articles;
};

/**
 * Increments number of shoutouts on an article and publication by one.
 * @function
 * @param {string} id - string representing the unique Object Id of an article.
 */
const incrementShoutouts = async (id: string): Promise<Article> => {
  const article = await ArticleModel.findById(new ObjectId(id));
  article.shoutouts += 1;
  return article.save();
};

export default {
  getAllArticles,
  getArticleByID,
  getArticlesAfterDate,
  getArticlesByIDs,
  getArticlesByPublication,
  getTrendingArticles,
  incrementShoutouts,
  refreshFeed,
};
