import { Resolver, Mutation, Arg, Query, FieldResolver, Root } from 'type-graphql';
import { Flyer } from '../entities/Flyer';
import FlyerRepo from '../repos/FlyerRepo';
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../common/constants';
import UserRepo from '../repos/UserRepo';

@Resolver((_of) => Flyer)
class FlyerResolver {
  @Query((_returns) => Flyer, {
    nullable: true,
    description: 'Returns a single <Flyer> via the given <id>',
  })
  async getFlyerByID(@Arg('id') id: string) {
    return FlyerRepo.getFlyerByID(id);
  }

  @Query((_returns) => [Flyer], {
    nullable: false,
    description: 'Returns a list of <Flyers> via the given list of <ids>',
  })
  async getFlyersByIDs(@Arg('ids', (type) => [String]) ids: string[]) {
    return FlyerRepo.getFlyersByIDs(ids);
  }

  @Query((_returns) => [Flyer], {
    nullable: false,
    description: `Returns a list of <Flyers> of size <limit> with offset <offset>. Default <limit> is ${DEFAULT_LIMIT} and default <offset> is 0`,
  })
  async getAllFlyers(
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    const Flyers = await FlyerRepo.getAllFlyers(offset, limit);
    return Flyers;
  }

  @Query((_returns) => [Flyer], {
    nullable: false,
    description:
      'Returns a list of <Flyers> of size <limit> via the given <publicationID>. Results can offsetted by <offset> >= 0.',
  })
  async getFlyersByOrganizationID(
    @Arg('publicationID') publicationID: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    return FlyerRepo.getFlyersByOrganizationID(publicationID, limit, offset);
  }

  @Query((_returns) => [Flyer], {
    nullable: false,
    description:
      'Returns a list of <Flyers> of size <limit> via the given list of <publicationIDs>. Results offsetted by <offset> >= 0.',
  })
  async getFlyersByOrganizationIDs(
    @Arg('publicationIDs', (type) => [String]) publicationIDs: string[],
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    return FlyerRepo.getFlyersByOrganizationIDs(publicationIDs, limit, offset);
  }

  @Query((_returns) => [Flyer], {
    nullable: false,
    description:
      'Returns a list of <Flyers> of size <limit> via the given <slug>. Results can be offsetted by <offset> >= 0.',
  })
  async getFlyersByOrganizationSlug(
    @Arg('slug') slug: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    return FlyerRepo.getFlyersByOrganizationSlug(slug, limit, offset);
  }

  @Query((_returns) => [Flyer], {
    nullable: false,
    description:
      'Returns a list of <Flyers> of size <limit> via the given list of <slugs>. Results can be offsetted by <offset> >= 0.',
  })
  async getFlyersByOrganizationSlugs(
    @Arg('slugs', (type) => [String]) slugs: string[],
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    return FlyerRepo.getFlyersByOrganizationSlugs(slugs, limit, offset);
  }

  @Query((_returns) => [Flyer], {
    nullable: false,
    description: `Returns a list of <Flyers> <since> a given date, limited by <limit>. 
  <since> is formatted as an compliant RFC 2822 timestamp. Valid examples include: "2019-01-31", "Aug 9, 1995", "Wed, 09 Aug 1995 00:00:00", etc. Default <limit> is ${DEFAULT_LIMIT}`,
  })
  async getFlyersAfterDate(
    @Arg('since') since: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
  ) {
    return FlyerRepo.getFlyersAfterDate(since, limit);
  }

  @Query((_returns) => [Flyer], {
    nullable: false,
    description: `Returns a list of trending <Flyers> of size <limit>. Default <limit> is ${DEFAULT_LIMIT}`,
  })
  async getTrendingFlyers(@Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number) {
    return FlyerRepo.getTrendingFlyers(limit);
  }

  @Query((_returns) => [Flyer], {
    nullable: false,
    description: `Returns a list of <Flyers> of size <limit> matches a particular query. Default <limit> is ${DEFAULT_LIMIT}`,
  })
  async searchFlyers(
    @Arg('query') query: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
  ) {
    return FlyerRepo.searchFlyers(query, limit);
  }

  @FieldResolver((_returns) => Number, { description: 'The trendiness score of a <Flyer>' })
  async trendiness(@Root() flyer: Flyer): Promise<number> {
    const presentDate = new Date().getTime();
    // Due to the way Mongo interprets 'Flyer' object,
    // Flyer['_doc'] must be used to access fields of a Flyer object
    return flyer['_doc'].shoutouts / ((presentDate - flyer['_doc'].date.getTime())/1000); // eslint-disable-line
  }

  @FieldResolver((_returns) => Boolean, {
    description: 'If an <Flyer> contains not suitable for work content',
  })
  async nsfw(@Root() flyer: Flyer): Promise<boolean> {
    return FlyerRepo.checkProfanity(flyer['_doc'].title); //eslint-disable-line
  }

  @Mutation((_returns) => Flyer, {
    nullable: true,
    description: `Increments the shoutouts of a <Flyer> with the given <id>.
  Increments the numShoutouts given of the user with the given [uuid].`,
  })
  async incrementShoutouts(@Arg('uuid') uuid: string, @Arg('id') id: string) {
    UserRepo.incrementShoutouts(uuid);
    return FlyerRepo.incrementShoutouts(id);
  }
}

export default FlyerResolver;
