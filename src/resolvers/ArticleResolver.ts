import { Resolver, Mutation, Arg, Query } from 'type-graphql';
import getRecentArticles from '../db/rss-parser';
import { Article, ArticleModel } from '../entities/Article';

@Resolver((_of) => Article)
export default class ArticleResolver {
  @Query((_returns) => Article, { nullable: false })
  async getArticleById(@Arg('id') id: string) {
    return ArticleModel.findById({ id });
  }

  @Query((_returns) => [Article], { nullable: false })
  async getAllArticles(@Arg('limit') limit: number) {
    return ArticleModel.find({}).limit(limit);
  }

  @Mutation((_returns) => [Article])
  async refresh() {
    let articles = await getRecentArticles();
    try {
      await ArticleModel.insertMany(articles, { ordered: false });
    } catch (e) {
      articles = e.insertedDocs;
    }
    return articles;
  }

  @Mutation(() => Boolean)
  async incrementLike(@Arg('id') id: string) {
    const article = await ArticleModel.findById({ id });
    article.likes += 1;
    await article.save();
  }
}
