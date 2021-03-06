/* eslint-disable */
import { Field, ObjectType } from 'type-graphql';
import { prop as Property } from '@typegoose/typegoose';

@ObjectType({ description: 'Holds information about social' })
export class Social {
  @Field()
  @Property()
  social: string;

  @Field()
  @Property()
  URL: string;
}
