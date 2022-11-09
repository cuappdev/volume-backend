/* eslint-disable no-underscore-dangle */
import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';
import { _ } from 'underscore';
import { Article, ArticleModel } from '../../entities/Article';
import { FactoryUtils } from './FactoryUtils';
import { PublicationModel } from '../../entities/Publication';

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

  public static fakeTemplate(): Article {
    /**
     * Returns a predefined Article object. Useful for testing
     * specific instance variables since we already know the value of them
     *
     * @returns The predefined Article object, look at ArticleFactory.ts
     * for exact details
     */
    const fakeArticle = new ArticleModel();
    const fakePublication = new PublicationModel();
    fakePublication.slug = 'nooz';
    fakePublication.backgroundImageURL =
      'https://raw.githubusercontent.com/cuappdev/assets/master/volume/nooz/background.png';
    fakePublication.bio = 'Takes fresh from the sticky part of our rejected article pile.';
    fakePublication.bioShort = 'News published with the utmost regard for veracity and originality';
    fakePublication.contentTypes = ['articles'];
    fakePublication.name = 'CU Nooz';
    fakePublication.profileImageURL =
      'https://raw.githubusercontent.com/cuappdev/assets/master/volume/nooz/profile.png';
    fakePublication.rssName = 'CU Nooz';
    fakePublication.rssURL = 'http://cunooz.com/feed/';
    fakePublication.websiteURL = 'http://cunooz.com';

    fakeArticle.articleURL =
      'http://cunooz.com/2022/11/02/op-ed-the-real-world-has-stingrays-so-why-doesnt-the-swim-test/';
    fakeArticle.date = new Date('2022-11-02T20:49:42Z');
    fakeArticle.imageURL =
      'https://raw.githubusercontent.com/cuappdev/assets/master/volume/placeholders//nooz.png';
    fakeArticle.isFiltered = false;
    fakeArticle.publication = fakePublication;
    fakeArticle.publicationSlug = 'nooz';
    fakeArticle.title = 'Op-Ed: The Real World Has Stingrays. So Why Doesn’t the Swim Test?';
    fakeArticle.isTrending = false;
    fakeArticle.nsfw = false;
    fakeArticle.shoutouts = 0;
    fakeArticle.trendiness = 0;

    return fakeArticle;
  }

  public static async fake(): Promise<Article> {
    /**
     * Returns a Article with random values in its instance variables
     *
     * @returns The Article object with random values in its instance variables
     */
    const fakeArticle = new Article();
    const examplePubs = await PublicationModel.aggregate().sample(1);
    const examplePub = await PublicationModel.findById(new ObjectId(examplePubs[0]._id));

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
