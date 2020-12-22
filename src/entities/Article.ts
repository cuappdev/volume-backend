import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, getModelForClass } from '@typegoose/typegoose';
import { Publication } from './Publication';

@ObjectType({ description: 'The Article Model' })
export class Article {
  @Field(() => ID)
  id: string;

  @Field()
  @Property({ unique: true })
  articleURL: string;

  @Field()
  @Property()
  date: Date;

  @Field()
  @Property()
  imageURL: string;

  @Field()
  @Property()
  publication: Publication | null;

  @Field()
  @Property()
  publicationSlug: string;

  @Field()
  @Property({ default: 0 })
  shoutouts?: number;

  @Field()
  @Property()
  title: string;
}

export const ArticleModel = getModelForClass(Article);
