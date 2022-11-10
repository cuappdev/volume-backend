/* eslint-disable no-underscore-dangle */
import { faker } from '@faker-js/faker';
import { _ } from 'underscore';
import PublicationFactory from './PublicationFactory';
import { Article } from '../../entities/Article';
import FactoryUtils from './FactoryUtils';

class ArticleFactory {
  public static async create(n: number): Promise<Article[]> {
    /**
     * Returns a list of n number of random Article objects
     *
     * @param n The number of desired random Article objects
     * @returns The list of n number of random Article objects
     */
    return Promise.all(FactoryUtils.create(n, ArticleFactory.fake)).then((articles) => {
      return articles;
    });
  }

  public static async fake(): Promise<Article> {
    /**
     * Returns a Article with random values in its instance variables
     *
     * @returns The Article object with random values in its instance variables
     */
    const fakeArticle = new Article();
    const examplePub = await PublicationFactory.getRandomPublication();

    fakeArticle.articleURL = faker.internet.url();
    fakeArticle.date = faker.date.past();
    fakeArticle.imageURL = faker.image.cats();
    fakeArticle.isFiltered = false;
    fakeArticle.publication = examplePub;
    fakeArticle.publicationSlug = examplePub.slug;
    fakeArticle.title = faker.commerce.productDescription();
    fakeArticle.isTrending = _.sample([true, false]);
    fakeArticle.nsfw = _.sample([true, false]);
    fakeArticle.shoutouts = _.random(0, 50);
    fakeArticle.trendiness = 0;

    return fakeArticle;
  }
}
export default ArticleFactory;
