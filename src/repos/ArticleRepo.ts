import { ObjectId } from 'mongodb';
import { Article, ArticleModel } from '../entities/Article';
import { PublicationModel } from '../entities/Publication';
import getRecentArticles from '../db/rss-parser';

const getArticleById = async (id: string): Promise<Article> => {
  return ArticleModel.findById(new ObjectId(id));
};

const getAllArticles = async (limit: number): Promise<Article[]> => {
  return ArticleModel.find({}).limit(limit);
};

const getArticlesByPublication = async (publicationID: string): Promise<Article[]> => {
  return ArticleModel.find({ publicationID });
};

const getArticlesByOffset = async (since: string, limit: number): Promise<Article[]> => {
  return ArticleModel.find({
    date: { $gte: new Date(new Date(since).setHours(0, 0, 0)) },
  })
    .sort({ date: 'desc' })
    .limit(limit);
};

/** A function to compare the trendiness of articles. */
export const compareTrendiness = (a1: Article, a2: Article) => {
  const presentDate = new Date().getTime();
  const a1Score = a1.shoutouts / (presentDate - a1.date.getTime());
  const a2Score = a2.shoutouts / (presentDate - a2.date.getTime());
  return a2Score - a1Score;
};

/**
 * Computes and returns the trending articles in the database.
 *
 * Trendiness is computed by taking the number of total shoutouts an article
 * has received and dividing it by the number of days since its been published.
 *
 * @function
 * @param {number} limit - number of articles to retrieve.
 * @param {Date} since - retrieve articles after this date.
 */
const getTrendingArticles = async (since: string, limit: number): Promise<Article[]> => {
  const articlesSinceDate = await ArticleModel.find({
    date: { $gte: new Date(new Date(since).setHours(0, 0, 0)) },
  }).exec();

  return articlesSinceDate.sort(compareTrendiness).slice(0, limit);
};

/**
 * Returns most recent articles published.
 */
const refreshFeed = async (): Promise<Article[]> => {
  let articles = await getRecentArticles();
  try {
    articles = await ArticleModel.insertMany(articles, { ordered: false });
  } catch (e) {
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
  const publication = await PublicationModel.findOne({ publicationID: article.publicationID });
  publication.shoutouts += 1;
  publication.save();
  return article.save();
};

export default {
  getArticleById,
  getAllArticles,
  getArticlesByPublication,
  getArticlesByOffset,
  getTrendingArticles,
  refreshFeed,
  incrementShoutouts,
};
