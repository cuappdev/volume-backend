import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, getModelForClass } from '@typegoose/typegoose';

@ObjectType({ description: 'The Article Model' })
export class Article {
  @Field(() => ID)
  id: string;

  @Field()
  @Property()
  title: string;

  @Field()
  @Property()
  publication: string;

  @Field()
  @Property({ unique: true })
  articleURL: string;

  @Field()
  @Property()
  imageURL: string;

  @Field()
  @Property()
  date: Date;

  @Field()
  @Property()
  shoutouts: number;
}

export const ArticleModel = getModelForClass(Article);
