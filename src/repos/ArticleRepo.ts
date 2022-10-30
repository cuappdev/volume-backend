import Filter from 'bad-words';
import { ObjectId } from 'mongodb';
import Fuse from 'fuse.js';
import { Article, ArticleModel } from '../entities/Article';
import {
  DEFAULT_LIMIT,
  MAX_NUM_DAYS_OF_TRENDING_ARTICLES,
  FILTERED_WORDS,
  DEFAULT_OFFSET,
} from '../common/constants';
import { PublicationModel } from '../entities/Publication';

const { IS_FILTER_ACTIVE } = process.env;

function isArticleFiltered(article: Article) {
  if (IS_FILTER_ACTIVE === 'true') {
    if (article.isFiltered) {
      // If the body has been checked already in microservice
      return true;
    }
    const filter = new Filter({ list: FILTERED_WORDS });
    return filter.isProfane(article.title);
  }
  return false;
}

const getArticleByID = async (id: string): Promise<Article> => {
  return ArticleModel.findById(new ObjectId(id)).then((article) => {
    if (!isArticleFiltered(article)) {
      return article;
    }
    return null;
  });
};

const getArticlesByIDs = async (ids: string[]): Promise<Article[]> => {
  return Promise.all(ids.map((id) => ArticleModel.findById(new ObjectId(id)))).then((articles) => {
    // Filter out all null values that were returned by ObjectIds not associated
    // with articles in database
    return articles.filter((article) => article !== null && !isArticleFiltered(article));
  });
};

const getAllArticles = async (
  offset = DEFAULT_OFFSET,
  limit = DEFAULT_LIMIT,
): Promise<Article[]> => {
  return ArticleModel.find({})
    .sort({ date: 'desc' })
    .skip(offset)
    .limit(limit)
    .then((articles) => {
      return articles.filter((article) => !isArticleFiltered(article));
    });
};

const getArticlesByPublicationSlug = async (
  slug: string,
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET,
): Promise<Article[]> => {
  return ArticleModel.find({ 'publication.slug': slug })
    .sort({ date: 'desc' })
    .skip(offset)
    .limit(limit)
    .then((articles) => {
      return articles.filter((article) => article !== null && !isArticleFiltered(article));
    });
};

const getArticlesByPublicationSlugs = async (
  slugs: string[],
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET,
): Promise<Article[]> => {
  const uniqueSlugs = [...new Set(slugs)];
  return ArticleModel.find({ 'publication.slug': { $in: uniqueSlugs } })
    .sort({ date: 'desc' })
    .skip(offset)
    .limit(limit)
    .then((articles) => {
      return articles.filter((article) => article !== null && !isArticleFiltered(article));
    });
};

const getArticlesByPublicationID = async (
  publicationID: string,
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET,
): Promise<Article[]> => {
  const publication = await (await PublicationModel.findById(publicationID)).execPopulate();
  return ArticleModel.find({ 'publication.slug': publication.slug })
    .sort({ date: 'desc' })
    .skip(offset)
    .limit(limit)
    .then((articles) => {
      return articles.filter((article) => !isArticleFiltered(article));
    });
};

const getArticlesByPublicationIDs = async (
  publicationIDs: string[],
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET,
): Promise<Article[]> => {
  const uniquePubIDs = [...new Set(publicationIDs)].map((id) => new ObjectId(id));
  console.log(uniquePubIDs);
  const pubSlugs = await PublicationModel.find({ _id: { $in: uniquePubIDs } }).select('slug');
  return getArticlesByPublicationSlugs(
    pubSlugs.map((pub) => pub.slug),
    limit,
    offset,
  );
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
      .then((articles) => {
        return articles.filter((article) => !isArticleFiltered(article));
      })
  );
};

/**
 * Performs fuzzy search on all articles to find articles with title/publisher matching the query.
 * @param query the term to search for
 * @param limit the number of results to return
 * @returns at most limit articles with titles or publishers matching the query
 */
const searchArticles = async (query: string, limit = DEFAULT_LIMIT) => {
  const allArticles = await ArticleModel.find({});
  const searcher = new Fuse(allArticles, {
    keys: ['title', 'publication.name'],
  });

  return searcher
    .search(query)
    .map((searchRes) => searchRes.item)
    .slice(0, limit);
};

/**
 * Computes and returns the trending articles in the database.
 *
 * @function
 * @param {number} limit - number of articles to retrieve.
 */
const getTrendingArticles = async (limit = DEFAULT_LIMIT): Promise<Article[]> => {
  const articles = await ArticleModel.find({ isTrending: true }).exec();
  return articles.filter((article) => !isArticleFiltered(article)).slice(0, limit);
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
  if (article) {
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
  getArticlesByPublicationSlug,
  getArticlesByPublicationSlugs,
  searchArticles,
  getTrendingArticles,
  incrementShoutouts,
  refreshTrendingArticles,
};
