import { Resolver, Mutation, Arg, Query } from 'type-graphql';
import { Article } from '../entities/Article';
import ArticleRepo from '../repos/ArticleRepo';

@Resolver((_of) => Article)
class ArticleResolver {
  @Query((_returns) => Article, { nullable: false })
  async getArticleByID(@Arg('id') id: string) {
    return ArticleRepo.getArticleById(id);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getAllArticles(@Arg('limit') limit: number) {
    return ArticleRepo.getAllArticles(limit);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesByPublication(@Arg('publicationID') publicationID: string) {
    return ArticleRepo.getArticlesByPublication(publicationID);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesByOffset(@Arg('since') since: string, @Arg('limit') limit: number) {
    return ArticleRepo.getArticlesByOffset(since, limit);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getTrendingArticles(@Arg('since') since: string, @Arg('limit') limit: number) {
    return ArticleRepo.getTrendingArticles(since, limit);
  }

  @Mutation((_returns) => [Article])
  async refresh() {
    return ArticleRepo.refreshFeed();
  }

  @Mutation((_returns) => Article)
  async incrementShoutouts(@Arg('id') id: string) {
    return ArticleRepo.incrementShoutouts(id);
  }
}

export default ArticleResolver;
