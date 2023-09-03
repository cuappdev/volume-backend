import Filter from 'bad-words';
import { ObjectId } from 'mongodb';

import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  FILTERED_WORDS,
  MAX_NUM_DAYS_OF_TRENDING_ARTICLES,
} from '../common/constants';
import { Article, ArticleModel } from '../entities/Article';
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

const getShuffledArticlesByPublicationSlugs = async (
  slugs: string[],
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET,
  timeRange = 12, // int value in months before current date to get articles from
): Promise<Article[]> => {
  // return a list of ArticleModels sorted by date, but each publisher has to show up at least once
  // before articles by the same publisher shows up again
  // e.g. publisher 1 has articles 1.1 (published jan 1), 1.2 (published jan 6)
  //      publisher 2 has articles 2.1 (published jan 5), 2.2 (published jan 4)
  //      publisher 3 has articles 3.1 (published jan 2), 3.2 (published jan 3)
  // the function should return [1.1, 3.1, 2.1, 3.2, 2.2, 1.2]
  const uniqueSlugs = [...new Set(slugs)];
  const since = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - timeRange,
    new Date().getDate(),
  );

  let mostByOnePub = 0;

  // by using the aggregate() function, create a dictionary of
  // { publicationSlug: [ArticleModel] }
  const articlesByPub = await ArticleModel.aggregate([
    {
      $match: {
        'publication.slug': { $in: uniqueSlugs },
        date: { $gte: since },
      },
    },
    {
      $sort: { date: -1 },
    },
    {
      $skip: offset,
    },
    {
      $limit: limit,
    },
    {
      $group: {
        _id: '$publication.slug',
        articles: { $push: '$$ROOT' },
      },
    },
  ]).then((articles) => {
    const filteredArticles = {};
    for (const a of articles) {
      filteredArticles[a._id] = a.articles.filter(
        (article) => article !== null && !isArticleFiltered(article),
      );
      mostByOnePub = Math.max(mostByOnePub, filteredArticles[a._id].length);
    }
    return filteredArticles;
  });

  // take the ith element from each array in articlesByPub, add it to a list named ithArticles,
  // sort it by date, then add it to shuffledArticles. Repeat until all arrays in articlesByPub are empty
  // if you are out of articles from a certain publisher, do not add anything from that publisher to ithArticles
  const shuffledArticles = [];
  for (let i = 0; i < mostByOnePub; i++) {
    const ithArticles = [];
    for (const key of Object.keys(articlesByPub)) {
      if (articlesByPub[key][i]) {
        ithArticles.push(new ArticleModel(articlesByPub[key][i])); // convert each article json object back to an ArticleModel object.
      }
    }
    ithArticles.sort((a, b) => {
      return b.date.getTime() - a.date.getTime();
    });
    shuffledArticles.push(...ithArticles);
  }
  return shuffledArticles;
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
  const articles = await ArticleModel.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } })
  const limitedArticles = articles.slice(0, limit)
  return limitedArticles
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
  getShuffledArticlesByPublicationSlugs,
  searchArticles,
  getTrendingArticles,
  incrementShoutouts,
  refreshTrendingArticles,
};
