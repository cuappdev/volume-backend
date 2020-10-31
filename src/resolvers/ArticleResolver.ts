import { Resolver, Mutation, Arg, Query } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { Article, ArticleModel } from '../entities/Article';
import getRecentArticles from '../db/rss-parser';

@Resolver((_of) => Article)
class ArticleResolver {
  @Query((_returns) => Article, { nullable: false })
  async getArticleByID(@Arg('id') id: string) {
    return ArticleModel.findById(new ObjectId(id));
  }

  @Query((_returns) => [Article], { nullable: false })
  async getAllArticles(@Arg('limit') limit: number) {
    return ArticleModel.find({}).limit(limit);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesByPublisher(@Arg('slug') slug: string) {
    return ArticleModel.find({ publication: slug });
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesByOffset(@Arg('since') since: string, @Arg('limit') limit: number) {
    return ArticleModel.find({
      date: { $gte: new Date(new Date(since).setHours(0, 0, 0)) },
    })
      .sort({ date: 'desc' })
      .limit(limit);
  }

  @Mutation((_returns) => [Article])
  async refresh() {
    let articles = await getRecentArticles();
    try {
      articles = await ArticleModel.insertMany(articles, { ordered: false });
    } catch (e) {
      articles = e.insertedDocs;
    }
    return articles;
  }

  @Mutation((_returns) => Article)
  async incrementLike(@Arg('id') id: string) {
    const article = await ArticleModel.findById(new ObjectId(id));
    article.likes += 1;
    return article.save();
  }
}

export default ArticleResolver;
