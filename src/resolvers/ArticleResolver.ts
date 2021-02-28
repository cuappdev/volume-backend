import { Resolver, Mutation, Arg, Query, FieldResolver, Root } from 'type-graphql';
import { Article } from '../entities/Article';
import ArticleRepo from '../repos/ArticleRepo';
import { Publication } from '../entities/Publication';
import PublicationRepo from '../repos/PublicationRepo';
import { DEFAULT_LIMIT } from '../common/constants';

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
    return ArticleRepo.getAllArticles(limit);
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

  @FieldResolver((_returns) => Number)
  async nsfw(@Root() article: Article): Promise<boolean> {
    return ArticleRepo.checkProfanity(article['doc'].title); //eslint-disable-line
  }

  @Mutation((_returns) => [Article])
  async refresh() {
    return ArticleRepo.refreshFeed();
  }

  @Mutation((_returns) => Article)
  async createArticle(
    @Arg('title') title: string,
    @Arg('articleURL') articleURL: string,
    @Arg('pubDate') pubDate: string,
    @Arg('pub') pub: string,
    @Arg('content') content: string,
  ) {
    return ArticleRepo.createArticle(title, articleURL, pubDate, pub, content);
  }

  @Mutation((_returns) => Article)
  async incrementShoutouts(@Arg('id') id: string) {
    return ArticleRepo.incrementShoutouts(id);
  }
}

export default ArticleResolver;
