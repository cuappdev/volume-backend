import { Resolver, Arg, Query } from 'type-graphql';
import publicationsJSON from '../../publications.json';
import Publication from '../entities/Publication';

const publicationsDB = publicationsJSON.publications;

@Resolver((_of) => Publication)
class PublicationResolver {
  @Query((_returns) => [Publication], { nullable: false })
  async getAllPublications() {
    const publicationArray = publicationsDB.map((publication) =>
      Object.assign(new Publication(), {
        articlesURL: publication.feed,
        bio: publication.bio,
        imageURL: publication.img,
        name: publication.name,
        slug: publication.slug,
        websiteURL: publication.url,
      }),
    );
    return publicationArray;
  }

  @Query((_returns) => Publication, { nullable: false })
  async getPublicationBySlug(@Arg('slug') slug: string) {
    const publicationData = publicationsDB.filter((publication) => publication.slug === slug)[0];
    return Object.assign(new Publication(), publicationData);
  }
}

export default PublicationResolver;
