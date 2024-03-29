import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, getModelForClass, index } from '@typegoose/typegoose';
import { Publication } from './Publication';

// Index magazines based on fields to be considered in search
@index({ title: 'text', 'publication.name': 'text' })
@ObjectType({ description: 'The Magazine Model' })
export class Magazine {
  @Field(() => ID)
  id: string;

  @Field()
  @Property()
  date: Date;

  @Field()
  @Property()
  semester: string;

  @Field()
  @Property()
  pdfURL: string;

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
  isFeatured: boolean;

  @Field()
  @Property({ default: 0 })
  trendiness: number;

  @Field()
  @Property()
  isFiltered: boolean;
}

export const MagazineModel = getModelForClass(Magazine);
