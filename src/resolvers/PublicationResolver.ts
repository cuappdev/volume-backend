import { Resolver, Arg, Query } from 'type-graphql';
import { Publication, PublicationModel } from '../entities/Publication';

@Resolver((_of) => Publication)
class PublicationResolver {
  @Query((_returns) => [Publication], { nullable: false })
  async getAllPublications() {
    return PublicationModel.find({});
  }

  @Query((_returns) => Publication, { nullable: false })
  async getPublicationBySlug(@Arg('slug') slug: string) {
    return PublicationModel.findOne({ slug });
  }
}

export default PublicationResolver;
