import { Resolver, Mutation, Arg, Query, FieldResolver, Root } from 'type-graphql';
import { Article } from '../entities/Article';
import ArticleRepo from '../repos/ArticleRepo';

@Resolver((_of) => Article)
class ArticleResolver {
  @Query((_returns) => Article, { nullable: false })
  async getArticleByID(@Arg('id') id: string) {
    return ArticleRepo.getArticleByID(id);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesByIDs(@Arg('ids', (type) => [String]) ids: string[]) {
    return ArticleRepo.getArticlesByIDs(ids);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getAllArticles(@Arg('limit', { defaultValue: 25 }) limit: number) {
    return ArticleRepo.getAllArticles(limit);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesByPublication(@Arg('publicationID') publicationID: string) {
    return ArticleRepo.getArticlesByPublication(publicationID);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesAfterDate(
    @Arg('since') since: string,
    @Arg('limit', { defaultValue: 25 }) limit: number,
  ) {
    return ArticleRepo.getArticlesAfterDate(since, limit);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getTrendingArticles(
    @Arg('since') since: string,
    @Arg('limit', { defaultValue: 25 }) limit: number,
  ) {
    return ArticleRepo.getTrendingArticles(since, limit);
  }

  @FieldResolver((_returns) => Number)
  async trendiness(@Root() article: Article): Promise<number> {
    const presentDate = new Date().getTime();
    // Due to the way Mongo interprets 'article' object,
    // article['_doc'] must be used to access fields of a article object
    // prettier - ignore
    return article['_doc'].shoutouts / (presentDate - article['_doc'].date.getTime()); // eslint-disable-line no-underscore-dangle
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
