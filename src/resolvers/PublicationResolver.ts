import { Arg, Resolver, Query, FieldResolver, Root } from 'type-graphql';
import { Article } from '../entities/Article';
import { Publication } from '../entities/Publication';
import PublicationRepo from '../repos/PublicationRepo';
import { SocialURLTuple } from '../common/types';

@Resolver((_of) => Publication)
class PublicationResolver {
  @Query((_returns) => [Publication], { nullable: false })
  async getAllPublications() {
    return PublicationRepo.getAllPublications();
  }

  @Query((_returns) => Publication, { nullable: true })
  async getPublicationByID(@Arg('id') id: string) {
    return PublicationRepo.getPublicationByID(id);
  }

  @Query((_returns) => [Publication])
  async getPublicationsByIDs(@Arg('ids', (type) => [String]) ids: string[]) {
    return PublicationRepo.getPublicationsByIDs(ids);
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

  @FieldResolver((_returns) => [SocialURLTuple])
  async socialURLs(@Root() publication: Publication): Promise<SocialURLTuple[]> {
    return PublicationRepo.getSocialURLs(publication);
  }
}

export default PublicationResolver;
