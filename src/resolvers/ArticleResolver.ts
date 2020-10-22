import {
  Resolver, Mutation, Arg, Query,
} from 'type-graphql';
import { Article, ArticleModel } from '../entities/Article';

@Resolver((_of) => Article)
export default class ArticleResolver {
  @Query((_returns) => Article, { nullable: false })
  async getArticleById(@Arg('id') id: String) {
    return ArticleModel.findById({ id });
  }

  @Query((_returns) => [Article], { nullable: false })
  async getAllArticles(@Arg('limit') limit:number) {
    return ArticleModel.find({}).limit(limit);
  }

  @Mutation(() => Boolean)
  async incrementLike(@Arg('id') id:String) {
    const article = await ArticleModel.findById({ id });
    article.likes += 1;
    await article.save();
  }
}
