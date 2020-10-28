import {
  Resolver, Mutation, Arg, Query,
} from 'type-graphql';
import { ObjectId } from 'mongodb';
import { Article, ArticleModel } from '../entities/Article';

@Resolver((_of) => Article)
export default class ArticleResolver {
  @Query((_returns) => Article, { nullable: false })
  async getArticleById(@Arg('id') id: string) {
    return await ArticleModel.findById(new ObjectId(id));
  }

  @Query((_returns) => [Article], { nullable: false })
  async getAllArticles(@Arg('limit') limit: number) {
    return await ArticleModel.find({}).limit(limit);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesByPublisher(@Arg('slug') slug: string) {
    return await ArticleModel.find({ publication: slug });
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesByOffset(@Arg('since') since: string, @Arg('limit') limit: number) {
    return await ArticleModel.find({
      date: { $gte: new Date(new Date(since).setHours(0, 0, 0)) },
    }).sort({ date: 'desc' }).limit(limit);
  }

  @Query((_returns) => [Article])
  async getTrendingArticles(@Arg('limit') limit: number) {
    return await ArticleModel.find({
      date: { $gte: new Date(Date.now() + 604800000) }
    }).sort({ likes: 'desc' }).limit(limit);
  }

  @Query((_returns) => [Article])
  async getUpdatedArticles() {
    // retrieves most recent articles using rss feed parser
    // puts them into the database
    // returns new articles
    return [];
  }

  @Mutation(() => Article)
  async incrementLike(@Arg('id') id: string) {
    const article = await ArticleModel.findById(new ObjectId(id));
    article.likes += 1;
    return await article.save();
  }
}
