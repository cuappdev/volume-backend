import { Article } from '../entities/Article';

/**
 * A comparator function to compare trendiness between two articles.
 *
 * Trendiness is computed by taking the number of total shoutouts an article
 * has received and dividing it by the number of days since its been published.
 */
export const compareTrendiness = (a1: Article, a2: Article) => {
  const presentDate = new Date().getTime();
  const a1Score = a1.shoutouts / (presentDate - a1.date.getTime());
  const a2Score = a2.shoutouts / (presentDate - a2.date.getTime());
  return a2Score - a1Score;
};

