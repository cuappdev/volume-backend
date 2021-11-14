import { Field, ID, ObjectType } from 'type-graphql';
import { prop as Property } from '@typegoose/typegoose';
import { Article } from './Article';

@ObjectType({ description: 'The Weekly Debrief Model' })
export default class WeeklyDebrief {
  @Field(() => ID)
  id: string;

  @Field()
  @Property()
  uuid: string; // uuid of user associated with this WeeklyDebrief

  @Field()
  @Property()
  createdAt: Date;

  @Field()
  @Property()
  expirationDate: Date;

  @Field()
  @Property()
  numShoutouts: number;

  @Field((type) => [Article])
  @Property()
  readArticles: [Article];

  @Field((type) => [Article])
  @Property()
  randomArticles: [Article];
}
