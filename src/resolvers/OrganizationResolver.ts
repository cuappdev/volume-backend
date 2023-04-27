import { Arg, Resolver, Query, FieldResolver, Root } from 'type-graphql';
import { Flyer } from '../entities/Flyer';
import { Organization } from '../entities/Organization';
import OrganizationRepo from '../repos/OrganizationRepo';

@Resolver((_of) => Organization)
class OrganizationResolver {
  @Query((_returns) => [Organization], {
    nullable: false,
    description: 'Returns a list of all <Organizations>',
  })
  async getAllOrganizations() {
    return OrganizationRepo.getAllOrganizations();
  }

  @Query((_returns) => [Organization], {
    nullable: true,
    description: 'Returns a list of <Organization>s via a given <categorySlug>',
  })
  async getOrganizationsByCategory(@Arg('categorySlug') categorySlug: string) {
    return OrganizationRepo.getOrganizationsByCategory(categorySlug);
  }

  @Query((_returns) => Organization, {
    nullable: true,
    description: 'Returns a single <Organization> via a given <id>',
  })
  async getOrganizationByID(@Arg('id') id: string) {
    return OrganizationRepo.getOrganizationByID(id);
  }

  @Query((_returns) => [Organization], {
    description: 'Returns a list of <Organizations> via a given list of <ids>',
  })
  async getOrganizationsByIDs(@Arg('ids', (type) => [String]) ids: string[]) {
    return OrganizationRepo.getOrganizationsByIDs(ids);
  }

  @Query((_returns) => Organization, {
    nullable: true,
    description: 'Returns a single <Organization> via a given <slug>',
  })
  async getOrganizationBySlug(@Arg('slug') slug: string) {
    return OrganizationRepo.getOrganizationBySlug(slug);
  }

  @FieldResolver((_returns) => Flyer, {
    nullable: true,
    description: 'The most recent <Flyer> of an <Organization>',
  })
  async mostRecentFlyer(@Root() organization: Organization): Promise<Flyer> {
    return OrganizationRepo.getMostRecentFlyer(organization);
  }

  @FieldResolver((_returns) => Number, {
    description: 'The total number of <Flyers> from an <Organization>',
  })
  async numFlyers(@Root() organization: Organization): Promise<number> {
    return OrganizationRepo.getNumFlyers(organization);
  }

  @FieldResolver((_returns) => Number, {
    description: "The total shoutouts of an <Organization's> <Flyers>",
  })
  async shoutouts(@Root() organization: Organization): Promise<number> {
    return OrganizationRepo.getShoutouts(organization);
  }
}

export default OrganizationResolver;
