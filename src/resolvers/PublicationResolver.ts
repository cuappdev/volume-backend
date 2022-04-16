import { Arg, Resolver, Query, FieldResolver, Root } from 'type-graphql';
import { Article } from '../entities/Article';
import { Publication } from '../entities/Publication';
import PublicationRepo from '../repos/PublicationRepo';
import { Social } from '../common/types';

@Resolver((_of) => Publication)
class PublicationResolver {
  @Query((_returns) => [Publication], { nullable: false, description: 'Returns a list of all <Publications>' })
  async getAllPublications() {
    return PublicationRepo.getAllPublications();
  }

  @Query((_returns) => Publication, { nullable: true, description: 'Returns a single <Publication> via a given <id>' })
  async getPublicationByID(@Arg('id') id: string) {
    return PublicationRepo.getPublicationByID(id);
  }

  @Query((_returns) => Publication, { nullable: true, description: 'Returns a single <Publication> via a given <slug>' })
  async getPublicationBySlug(@Arg('slug') slug: string) {
    return PublicationRepo.getPublicationBySlug(slug);
  }

  @Query((_returns) => [Publication], {description: 'Returns a list of <Publications> via a given list of <ids>'})
  async getPublicationsByIDs(@Arg('ids', (type) => [String]) ids: string[]) {
    return PublicationRepo.getPublicationsByIDs(ids);
  }

  @FieldResolver((_returns) => Article, { nullable: true, description: 'The most recent <Article> of a <Publication>' })
  async mostRecentArticle(@Root() publication: Publication): Promise<Article> {
    return PublicationRepo.getMostRecentArticle(publication);
  }

  @FieldResolver((_returns) => Number, {description: 'The total shoutouts of a <Publication\'s> <Articles>'})
  async shoutouts(@Root() publication: Publication): Promise<number> {
    return PublicationRepo.getShoutouts(publication);
  }

  @FieldResolver((_returns) => Number, {description: 'The total number of <Articles> from a <Publication>'})
  async numArticles(@Root() publication: Publication): Promise<number> {
    return PublicationRepo.getNumArticles(publication);
  }

  @FieldResolver((_returns) => [Social], {description: 'The information about a <Publication\'s> social platforms.'})
  async socials(@Root() publication: Publication): Promise<Social[]> {
    return PublicationRepo.getSocialURLs(publication);
  }
}

export default PublicationResolver;
