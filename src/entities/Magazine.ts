import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, getModelForClass } from '@typegoose/typegoose';
import { Publication } from './Publication';

@ObjectType({ description: 'The Magazine Model' })
export class Magazine {
  @Field(() => ID)
  id: string;

  @Field()
  @Property({ unique: true })
  magazineURL: string;

  @Field()
  @Property()
  date: Date;

  @Field()
  @Property()
  PDF: string; // Placeholder

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
  isTrending: boolean; // Maybe

  @Field()
  @Property()
  isFiltered: boolean;
}

export const MagazineModel = getModelForClass(Magazine);
