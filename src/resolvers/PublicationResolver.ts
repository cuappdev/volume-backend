import { Arg, Resolver, Query, FieldResolver, Root } from 'type-graphql';
import { Article } from '../entities/Article';
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

  @FieldResolver((_returns) => Article, { nullable: true })
  async mostRecentArticle(@Root() publication: Publication): Promise<Article> {
    return PublicationRepo.getMostRecentArticle(publication);
  }

  @FieldResolver((_returns) => Number)
  async shoutouts(@Root() publication: Publication): Promise<number> {
    return PublicationRepo.getShoutouts(publication);
  }

  @FieldResolver((_returns) => Number)
  async numArticles(@Root() publication: Publication): Promise<number> {
    return PublicationRepo.getNumArticles(publication);
  }
}

export default PublicationResolver;
