import { Resolver, Mutation, Arg, Query, FieldResolver, Root } from 'type-graphql';
import { Magazine } from '../entities/Magazine';
import MagazineRepo from '../repos/MagazineRepo';
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../common/constants';
import UserRepo from '../repos/UserRepo';

@Resolver((_of) => Magazine)
class MagazineResolver {
  @Query((_returns) => [Magazine], {
    nullable: false,
    description: `Returns a list of <Magazines> of size <limit> with offset <offset>. Default <limit> is ${DEFAULT_LIMIT} and default <offset> is 0`,
  })
  async getAllMagazines(
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    const magazine = await MagazineRepo.getAllMagazines(offset, limit);
    return magazine;
  }

  @Query((_returns) => [Magazine], {
    nullable: false,
    description:
      'Returns a list of <Magazines> of size <limit> via a given <semester>. Results can be offsetted by <offset> >= 0. Semesters are formatted like "fa22" ',
  })
  async getMagazinesBySemester(
    @Arg('semester', (type) => String) semester: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    return MagazineRepo.getMagazinesBySemester(semester.toLowerCase(), limit, offset);
  }

  @Query((_returns) => [Magazine], {
    nullable: false,
    description:
      'Returns a list of <Magazines> of size <limit> via the given <slug>. Results can be offsetted by <offset> >= 0.',
  })
  async getMagazinesByPublicationSlug(
    @Arg('slug') slug: string,
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    return MagazineRepo.getMagazinesByPublicationSlug(slug, limit, offset);
  }

  @Query((_returns) => [Magazine], {
    nullable: false,
    description:
      'Returns a list of <Magazines> of size <limit> via the given list of <slugs>. Results can be offsetted by <offset> >= 0.',
  })
  async getMagazinesByPublicationSlugs(
    @Arg('slugs', (type) => [String]) slugs: string[],
    @Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number,
    @Arg('offset', { defaultValue: DEFAULT_OFFSET }) offset: number,
  ) {
    return MagazineRepo.getMagazinesByPublicationSlugs(slugs, limit, offset);
  }

  @Query((_returns) => Magazine, {
    nullable: true,
    description: 'Returns a single <Magazine> via the given <id>',
  })
  async getMagazineByID(@Arg('id') id: string) {
    return MagazineRepo.getMagazineByID(id);
  }

  @Query((_returns) => [Magazine], {
    nullable: false,
    description: 'Returns a list of <Magazines> via the given list of <ids>',
  })
  async getMagazinesByIDs(@Arg('ids', (type) => [String]) ids: string[]) {
    return MagazineRepo.getMagazinesByIDs(ids);
  }

  @Query((_returns) => [Magazine], {
    nullable: true,
    description: 'Returns a list of featured <Magazines> of size <limit>.',
  })
  async getFeaturedMagazines(@Arg('limit', { defaultValue: DEFAULT_LIMIT }) limit: number) {
    return MagazineRepo.getFeaturedMagazines(limit);
  }

  @FieldResolver((_returns) => Number, { description: 'The trendiness score of an <Magazine>' })
  async trendiness(@Root() magazine: Magazine): Promise<number> {
    const presentDate = new Date().getTime();
    // Due to the way Mongo interprets 'magazine' object,
    // magazine['_doc'] must be used to access fields of a magazine object
    return magazine['_doc'].shoutouts / (presentDate - magazine['_doc'].date.getTime()); // eslint-disable-line
  }

  @FieldResolver((_returns) => Boolean, {
    description: 'If a <Magazine> contains not suitable for work content',
  })
  async nsfw(@Root() magazine: Magazine): Promise<boolean> {
    return MagazineRepo.checkProfanity(magazine['_doc'].title); //eslint-disable-line
  }

  @Mutation((_returns) => Magazine, {
    nullable: true,
    description: `Increments the shoutouts of an <Magazine> with the given <id>.
    Increments the numShoutouts given of the user with the given [uuid].`,
  })
  async incrementMagazineShoutouts(@Arg('uuid') uuid: string, @Arg('id') id: string) {
    UserRepo.incrementShoutouts(uuid);
    return MagazineRepo.incrementShoutouts(id);
  }
}

export default MagazineResolver;
