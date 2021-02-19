import { Resolver, Mutation, Arg, Query, FieldResolver, Root } from 'type-graphql';
import { Article } from '../entities/Article';
import ArticleRepo from '../repos/ArticleRepo';
import Constants from '../common/constants';
import { Publication } from '../entities/Publication';
import PublicationRepo from '../repos/PublicationRepo';

@Resolver((_of) => Article)
class ArticleResolver {
  @Query((_returns) => Article, { nullable: true })
  async getArticleByID(@Arg('id') id: string) {
    return ArticleRepo.getArticleByID(id);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesByIDs(@Arg('ids', (type) => [String]) ids: string[]) {
    return ArticleRepo.getArticlesByIDs(ids);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getAllArticles(@Arg('limit', { defaultValue: Constants.DEFAULT_LIMIT }) limit: number) {
    return ArticleRepo.getAllArticles(limit);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesByPublication(@Arg('publicationID') publicationID: string) {
    return ArticleRepo.getArticlesByPublication(publicationID);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesAfterDate(
    @Arg('since') since: string,
    @Arg('limit', { defaultValue: Constants.DEFAULT_LIMIT }) limit: number,
  ) {
    return ArticleRepo.getArticlesAfterDate(since, limit);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getTrendingArticles(
    @Arg('limit', { defaultValue: Constants.DEFAULT_LIMIT }) limit: number,
  ) {
    return ArticleRepo.getTrendingArticles(limit);
  }

  @FieldResolver((_returns) => Publication)
  async publication(@Root() article: Article): Promise<Publication> {
    return PublicationRepo.getPublicationBySlug(article['_doc'].publicationSlug); // eslint-disable-line
  }

  @FieldResolver((_returns) => Number)
  async trendiness(@Root() article: Article): Promise<number> {
    const presentDate = new Date().getTime();
    // Due to the way Mongo interprets 'article' object,
    // article['_doc'] must be used to access fields of a article object
    return article['_doc'].shoutouts / (presentDate - article['_doc'].date.getTime()); // eslint-disable-line
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
