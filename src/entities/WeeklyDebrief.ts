import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property, DocumentType } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { Article } from './Article';

@ObjectType({ description: 'The Weekly Debrief Model' })
export default class WeeklyDebrief {
  @Field(() => ID)
  id: string;

  @Field()
  @Property()
  uuid: string;

  @Field()
  @Property()
  creationDate: Date;

  @Field()
  @Property()
  expirationDate: Date;

  @Field()
  @Property({ default: 0 })
  numShoutouts?: number;

  @Field()
  @Property({ default: 0 })
  numBookmarkedArticles?: number;

  @Field()
  @Property({ default: 0 })
  numReadArticles?: number;

  @Field((type) => [Article])
  @Property({ required: true, type: () => Article, default: [] })
  readArticles: mongoose.Types.DocumentArray<DocumentType<Article>>;

  @Field((type) => [Article])
  @Property({ required: true, type: () => Article, default: [] })
  randomArticles: mongoose.Types.DocumentArray<DocumentType<Article>>;
}
