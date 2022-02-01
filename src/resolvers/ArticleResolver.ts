import { Resolver, Mutation, Arg, Query, FieldResolver, Root } from 'type-graphql';
import { Article } from '../entities/Article';
import ArticleRepo from '../repos/ArticleRepo';
import { DEFAULT_LIMIT } from '../common/constants';
import UserRepo from '../repos/UserRepo';

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
  async getAllArticles(@Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number) {
    const articles = await ArticleRepo.getAllArticles(limit);
    return articles;
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesByPublicationID(@Arg('publicationID') publicationID: string) {
    return ArticleRepo.getArticlesByPublicationID(publicationID);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesByPublicationIDs(
    @Arg('publicationIDs', (type) => [String]) publicationIDs: string[],
  ) {
    return ArticleRepo.getArticlesByPublicationIDs(publicationIDs);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getArticlesAfterDate(
    @Arg('since') since: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
  ) {
    return ArticleRepo.getArticlesAfterDate(since, limit);
  }

  @Query((_returns) => [Article], { nullable: false })
  async getTrendingArticles(@Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number) {
    return ArticleRepo.getTrendingArticles(limit);
  }

  @FieldResolver((_returns) => Number)
  async trendiness(@Root() article: Article): Promise<number> {
    const presentDate = new Date().getTime();
    // Due to the way Mongo interprets 'article' object,
    // article['_doc'] must be used to access fields of a article object
    return article['_doc'].shoutouts / (presentDate - article['_doc'].date.getTime()); // eslint-disable-line
  }

  @FieldResolver((_returns) => Boolean)
  async nsfw(@Root() article: Article): Promise<boolean> {
    return ArticleRepo.checkProfanity(article['_doc'].title); //eslint-disable-line
  }

  @Mutation((_returns) => Article, { nullable: true })
  async incrementShoutouts(@Arg('uuid') uuid: string, @Arg('id') id: string) {
    UserRepo.incrementShoutouts(uuid);
    return ArticleRepo.incrementShoutouts(id);
  }
}

export default ArticleResolver;
