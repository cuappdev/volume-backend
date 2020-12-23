import { Resolver, Arg, Query, FieldResolver, Root } from 'type-graphql';
import { Publication } from '../entities/Publication';
import { Article } from '../entities/Article';
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

  @FieldResolver((_returns) => Article)
  async mostRecentArticle(@Root() publication: Publication): Promise<Article> {
    return PublicationRepo.getMostRecentArticle(publication);
  }

  @FieldResolver((_returns) => Number)
  async shoutouts(@Root() publication: Publication): Promise<Number> {
    return PublicationRepo.getShoutouts(publication);
  }
}

export default PublicationResolver;
