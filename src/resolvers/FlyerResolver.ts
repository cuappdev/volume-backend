import {
  Resolver,
  Mutation,
  Arg,
  Query,
  FieldResolver,
  Root,
  UseMiddleware,
  Ctx,
} from 'type-graphql';
import { Context } from 'vm';
import { Flyer } from '../entities/Flyer';
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../common/constants';
import FlyerRepo from '../repos/FlyerRepo';
import FlyerMiddleware from '../middlewares/FlyerMiddleware';

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
      'Returns a list of <Flyers> of size <limit> via the given <organizationID>. Results can offsetted by <offset> >= 0.',
  })
  async getFlyersByOrganizationID(
    @Arg('organizationID') organizationID: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    return FlyerRepo.getFlyersByOrganizationID(organizationID, limit, offset);
  }

  @Query((_returns) => [Flyer], {
    nullable: false,
    description:
      'Returns a list of <Flyers> of size <limit> via the given list of <organizationIDs>. Results offsetted by <offset> >= 0.',
  })
  async getFlyersByOrganizationIDs(
    @Arg('organizationIDs', (type) => [String]) organizationIDs: string[],
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    return FlyerRepo.getFlyersByOrganizationIDs(organizationIDs, limit, offset);
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
    <since> must be in UTC ISO8601 format (e.g. YYYY-mm-ddTHH:MM:ssZ). Default <limit> is ${DEFAULT_LIMIT}`,
  })
  async getFlyersAfterDate(
    @Arg('since') since: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
  ) {
    return FlyerRepo.getFlyersAfterDate(since, limit);
  }

  @Query((_returns) => [Flyer], {
    nullable: false,
    description: `Returns a list of <Flyers> <before> a given date, limited by <limit>.
    <before> must be in UTC ISO8601 format (e.g. YYYY-mm-ddTHH:MM:ssZ). Default <limit> is ${DEFAULT_LIMIT}`,
  })
  async getFlyersBeforeDate(
    @Arg('before') before: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
  ) {
    return FlyerRepo.getFlyersBeforeDate(before, limit);
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

  @Query((_return) => [Flyer], {
    nullable: false,
    description: `Returns a list of <Flyers> of size <limit> given a <categorySlug>, sorted by start date descending. Results can be offsetted by <offset> >= 0. Default <limit> is ${DEFAULT_LIMIT}`,
  })
  async getFlyersByCategorySlug(
    @Arg('categorySlug') categorySlug: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    return FlyerRepo.getFlyersByCategorySlug(categorySlug, limit, offset);
  }

  @FieldResolver((_returns) => Number, { description: 'The trendiness score of a <Flyer>' })
  async trendiness(@Root() flyer: Flyer): Promise<number> {
    const presentDate = new Date().getTime();
    // Due to the way Mongo interprets 'Flyer' object,
    // Flyer['_doc'] must be used to access fields of a Flyer object
    return flyer['_doc'].timesClicked / ((presentDate - flyer['_doc'].startDate.getTime()) / 1000); // eslint-disable-line
  }

  @Mutation((_returns) => Flyer, {
    nullable: true,
    description: `Increments the times clicked of a <Flyer> with the given <id>.`,
  })
  async incrementTimesClicked(@Arg('id') id: string) {
    return FlyerRepo.incrementTimesClicked(id);
  }

  @Mutation((_returns) => Flyer, {
    description: `Creates a single <Flyer> via given <categorySlug>, <endDate>, <flyerURL>, <imageB64>, <location>, <organizationID>, <startDate>, and <title>.
    <startDate> and <endDate> must be in UTC ISO8601 format (e.g. YYYY-mm-ddTHH:MM:ssZ).
    <imageB64> must be a Base64 encrypted string without 'data:image/png;base64,' prepended`,
  })
  @UseMiddleware(FlyerMiddleware.FlyerUploadErrorInterceptor)
  async createFlyer(
    @Arg('categorySlug') categorySlug: string,
    @Arg('endDate') endDate: string,
    @Arg('flyerURL', { nullable: true }) flyerURL: string,
    @Arg('imageB64') imageB64: string,
    @Arg('location') location: string,
    @Arg('organizationID') organizationID: string,
    @Arg('startDate') startDate: string,
    @Arg('title') title: string,
    @Ctx() ctx: Context,
  ) {
    return FlyerRepo.createFlyer(
      categorySlug,
      endDate,
      flyerURL,
      ctx.imageURL,
      location,
      organizationID,
      startDate,
      title,
    );
  }

  @Mutation((_returns) => Flyer, {
    description: `Delete a flyer with the id <id>.`,
  })
  async deleteFlyer(@Arg('id') id: string) {
    return FlyerRepo.deleteFlyer(id);
  }
}

export default FlyerResolver;
