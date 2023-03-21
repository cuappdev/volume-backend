import { Resolver, Mutation, Arg, Query, FieldResolver, Root } from 'type-graphql';
import { Article } from '../entities/Article';
import ArticleRepo from '../repos/ArticleRepo';
import { DEFAULT_LIMIT, DEFAULT_OFFSET, DEFAULT_RANGE } from '../common/constants';
import UserRepo from '../repos/UserRepo';

@Resolver((_of) => Article)
class ArticleResolver {
  @Query((_returns) => Article, {
    nullable: true,
    description: 'Returns a single <Article> via the given <id>',
  })
  async getArticleByID(@Arg('id') id: string) {
    return ArticleRepo.getArticleByID(id);
  }

  @Query((_returns) => [Article], {
    nullable: false,
    description: 'Returns a list of <Articles> via the given list of <ids>',
  })
  async getArticlesByIDs(@Arg('ids', (type) => [String]) ids: string[]) {
    return ArticleRepo.getArticlesByIDs(ids);
  }

  @Query((_returns) => [Article], {
    nullable: false,
    description: `Returns a list of <Articles> of size <limit> with offset <offset>. Default <limit> is ${DEFAULT_LIMIT} and default <offset> is 0`,
  })
  async getAllArticles(
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    const articles = await ArticleRepo.getAllArticles(offset, limit);
    return articles;
  }

  @Query((_returns) => [Article], {
    nullable: false,
    description:
      'Returns a list of <Articles> of size <limit> via the given <publicationID>. Results can offsetted by <offset> >= 0.',
  })
  async getArticlesByPublicationID(
    @Arg('publicationID') publicationID: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    return ArticleRepo.getArticlesByPublicationID(publicationID, limit, offset);
  }

  @Query((_returns) => [Article], {
    nullable: false,
    description:
      'Returns a list of <Articles> of size <limit> via the given list of <publicationIDs>. Results offsetted by <offset> >= 0.',
  })
  async getArticlesByPublicationIDs(
    @Arg('publicationIDs', (type) => [String]) publicationIDs: string[],
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    return ArticleRepo.getArticlesByPublicationIDs(publicationIDs, limit, offset);
  }

  @Query((_returns) => [Article], {
    nullable: false,
    description:
      'Returns a list of <Articles> of size <limit> via the given <slug>. Results can be offsetted by <offset> >= 0.',
  })
  async getArticlesByPublicationSlug(
    @Arg('slug') slug: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    return ArticleRepo.getArticlesByPublicationSlug(slug, limit, offset);
  }

  @Query((_returns) => [Article], {
    nullable: false,
    description:
      'Returns a list of <Articles> of size <limit> via the given list of <slugs>. Results can be offsetted by <offset> >= 0.',
  })
  async getArticlesByPublicationSlugs(
    @Arg('slugs', (type) => [String]) slugs: string[],
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    return ArticleRepo.getArticlesByPublicationSlugs(slugs, limit, offset);
  }

  @Query((_returns) => [Article], {
    nullable: false,
    description:
      'Returns a list of <Articles> of size <limit> via the given list of <slugs>, shuffled so that each publication apears once before appearing again in the same batch. Individual batches are sorted chronologically. Results can be offsetted by<offset> >= 0.',
  })
  async getShuffledArticlesByPublicationSlugs(
    @Arg('slugs', (type) => [String]) slugs: string[],
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
    @Arg('timeRange', { defaultValue: DEFAULT_RANGE }) timeRange: number,
  ) {
    return ArticleRepo.getShuffledArticlesByPublicationSlugs(slugs, limit, offset, timeRange);
  }

  @Query((_returns) => [Article], {
    nullable: false,
    description: `Returns a list of <Articles> <since> a given date, limited by <limit>. 
  <since> is formatted as an compliant RFC 2822 timestamp. Valid examples include: "2019-01-31", "Aug 9, 1995", "Wed, 09 Aug 1995 00:00:00", etc. Default <limit> is ${DEFAULT_LIMIT}`,
  })
  async getArticlesAfterDate(
    @Arg('since') since: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
  ) {
    return ArticleRepo.getArticlesAfterDate(since, limit);
  }

  @Query((_returns) => [Article], {
    nullable: false,
    description: `Returns a list of trending <Articles> of size <limit>. Default <limit> is ${DEFAULT_LIMIT}`,
  })
  async getTrendingArticles(@Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number) {
    return ArticleRepo.getTrendingArticles(limit);
  }

  @Query((_returns) => [Article], {
    nullable: false,
    description: `Returns a list of <Articles> of size <limit> matches a particular query. Default <limit> is ${DEFAULT_LIMIT}`,
  })
  async searchArticles(
    @Arg('query') query: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
  ) {
    return ArticleRepo.searchArticles(query, limit);
  }

  @FieldResolver((_returns) => Number, { description: 'The trendiness score of an <Article>' })
  async trendiness(@Root() article: Article): Promise<number> {
    const presentDate = new Date().getTime();
    // Due to the way Mongo interprets 'article' object,
    // article['_doc'] must be used to access fields of a article object
    return article['_doc'].shoutouts / ((presentDate - article['_doc'].date.getTime()) / 1000); // eslint-disable-line
  }

  @FieldResolver((_returns) => Boolean, {
    description: 'If an <Article> contains not suitable for work content',
  })
  async nsfw(@Root() article: Article): Promise<boolean> {
    return ArticleRepo.checkProfanity(article['_doc'].title); //eslint-disable-line
  }

  @Mutation((_returns) => Article, {
    nullable: true,
    description: `Increments the shoutouts of an <Article> with the given <id>.
  Increments the numShoutouts given of the user with the given [uuid].`,
  })
  async incrementShoutouts(@Arg('uuid') uuid: string, @Arg('id') id: string) {
    UserRepo.incrementShoutouts(uuid);
    return ArticleRepo.incrementShoutouts(id);
  }
}

export default ArticleResolver;
