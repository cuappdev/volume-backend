import { ObjectId } from 'mongodb';
import { Article, ArticleModel } from '../entities/Article';
import { PublicationModel } from '../entities/Publication';
import getRecentArticles from '../db/rss-parser';

const getArticleByID = async (id: string): Promise<Article> => {
  return ArticleModel.findById(new ObjectId(id));
};

const getArticlesByIDs = async (ids: string[]): Promise<Article[]> => {
  return Promise.all(ids.map((id) => ArticleModel.findById(new ObjectId(id)))).then((articles) => {
    return articles;
  });
};

const getAllArticles = async (limit = 25): Promise<Article[]> => {
  return ArticleModel.find({}).limit(limit);
};

const getArticlesByPublication = async (publicationID: string): Promise<Article[]> => {
  return ArticleModel.find({ publicationID });
};

const getArticlesAfterDate = async (since: string, limit = 25): Promise<Article[]> => {
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

/** A function to compare the trendiness of articles.
 *
 * Trendiness is computed by taking the number of total shoutouts an article
 * has received and dividing it by the number of days since its been published.
 *
 */
export const compareTrendiness = (a1: Article, a2: Article) => {
  // const presentDate = new Date().getTime();
  // const a1Score = a1.shoutouts / (presentDate - a1.date.getTime());
  // const a2Score = a2.shoutouts / (presentDate - a2.date.getTime());
  return a2.trendiness - a1.trendiness;
};

/**
 * Computes and returns the trending articles in the database.
 *
 * @function
 * @param {number} limit - number of articles to retrieve.
 * @param {string} since - retrieve articles after this date.
 */
const getTrendingArticles = async (since: string, limit = 25): Promise<Article[]> => {
  const articlesSinceDate = await ArticleModel.find({
    date: { $gte: new Date(new Date(since).setHours(0, 0, 0)) },
  }).exec();

  return articlesSinceDate.sort({ trendiness: 'desc' }).slice(0, limit);
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
  const publication = await PublicationModel.findOne({ publicationID: article.publication.id });
  publication.shoutouts += 1;
  publication.save();
  return article.save();
};

export default {
  getArticleByID,
  getArticlesByIDs,
  getAllArticles,
  getArticlesByPublication,
  getArticlesAfterDate,
  getTrendingArticles,
  refreshFeed,
  incrementShoutouts,
};
