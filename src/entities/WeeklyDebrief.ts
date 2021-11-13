import { Field, ID, ObjectType } from 'type-graphql';
import { Article } from './Article';

@ObjectType({ description: 'The Weekly Debrief Model' })
export default class WeeklyDebrief {
  @Field(() => ID)
  id: string;

  @Field()
  uuid: string;

  @Field()
  readArticles: [Article];

  @Field()
  numShoutouts: number;
}
