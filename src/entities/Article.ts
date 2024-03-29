import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, getModelForClass, index } from '@typegoose/typegoose';
import { Publication } from './Publication';

// Index articles based on fields to be considered in search
@index({ title: 'text', 'publication.name': 'text' })
@ObjectType({ description: 'The Article Model' })
export class Article {
  @Field(() => ID)
  id: string;

  @Field()
  @Property()
  articleURL: string;

  @Field()
  @Property()
  date: Date;

  @Field()
  @Property()
  imageURL: string;

  @Field((type) => Publication)
  @Property({ type: () => Publication })
  publication: Publication;

  @Field()
  @Property()
  publicationSlug: string;

  @Field()
  @Property({ default: 0 })
  shoutouts?: number;

  @Field()
  @Property()
  title: string;

  @Field()
  @Property({ default: false })
  nsfw: boolean;

  @Field()
  @Property({ default: false })
  isTrending: boolean;

  @Field()
  @Property({ default: 0 })
  trendiness: number;

  @Field()
  @Property()
  isFiltered: boolean;
}

export const ArticleModel = getModelForClass(Article);
