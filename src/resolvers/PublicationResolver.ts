import { Resolver, Arg, Query } from 'type-graphql';
import { Publication } from '../entities/Publication';
import PublicationRepo from '../repos/PublicationRepo';

@Resolver((_of) => Publication)
class PublicationResolver {
  @Query((_returns) => [Publication], { nullable: false })
  async getAllPublications() {
    return PublicationRepo.getAllPublications();
  }

  @Query((_returns) => Publication, { nullable: false })
  async getPublicationByID(@Arg('id') id: string) {
    return PublicationRepo.getPublicationByID(id);
  }
}

export default PublicationResolver;
