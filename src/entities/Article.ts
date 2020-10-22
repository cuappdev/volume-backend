import { ObjectType, Field, ID } from 'type-graphql';
import { prop as Property, getModelForClass } from '@typegoose/typegoose';

@ObjectType({ description: 'The Article Model' })
export class Article {
  @Field(() => ID)
  id: String;

  @Field()
  @Property()
  title: String;

  @Field()
  @Property()
  publication: String;

  @Field()
  @Property()
  articleURL: String;

  @Field()
  @Property()
  imageURL: String;

  @Field()
  @Property()
  date: String;

  @Field()
  @Property()
  likes: number;
}

export const ArticleModel = getModelForClass(Article);
