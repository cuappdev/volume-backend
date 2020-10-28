import { Resolver, Arg, Query } from 'type-graphql';
import * as publications from '../../publications.json';
import Publication from '../entities/Publication';

const publicationsDB = publications.publications;

@Resolver((_of) => Publication)
class PublicationResolver {
  @Query((_returns) => [Publication], { nullable: false })
  async getAllPublications() {
    const publicationArray = publicationsDB.map((publication) =>
      Object.assign(new Publication(), {
        slug: publication.slug,
        bio: publication.bio,
        feed: publication.feed,
        img: publication.img,
        url: publication.url,
        name: publication.name,
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
